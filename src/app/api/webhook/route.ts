import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { genererEmailConfirmation } from '@/lib/mail'
import { genererPDFFormulaire } from '@/lib/pdf'
import { genererFacture } from '@/lib/facture'
import { genererAnnexeCFE } from '@/lib/annexe-cfe'
import { AvisCfe } from '@/types/avis-cfe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const simulationId = session.metadata?.simulationId
    if (!simulationId) return NextResponse.json({ ok: true })

    await supabaseAdmin
      .from('simulations')
      .update({
        stripe_session_id: session.id,
        stripe_payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', simulationId)

    const { data: sim } = await supabaseAdmin
      .from('simulations')
      .select('*, avis_cfe(*)')
      .eq('id', simulationId)
      .single()

    if (!sim) return NextResponse.json({ ok: true })

    // Convert avis_cfe to proper type
    const avisCfe: AvisCfe[] = sim.avis_cfe || []
    const simData = {
      ...sim,
      avis_cfe: avisCfe.map((a: any) => ({
        id: a.id,
        montantCfe: a.montant_cfe,
        cotisationMin: a.cotisation_min,
        ligne9: a.ligne9,
        numeroAvis: a.numero_avis,
        numeroRole: a.numero_role,
        departement: a.departement,
        adresseEtablissement: a.adresse_etablissement,
        siret: a.siret,
        estPrincipal: a.est_principal,
        nomRedevable: a.nom_redevable,
        commune: a.commune,
        lieuImposition: a.lieu_imposition,
      }))
    }

    const { subject, html } = genererEmailConfirmation(simData)
    const attachments: Array<{ filename: string; content: string }> = []

    // Formulaire officiel pré-rempli
    try {
      const pdfBuffer = await genererPDFFormulaire(simData)
      const formName = sim.regime === 'reel' ? '1327-CET-SD' : '1327-S-CET-SD'
      attachments.push({
        filename: `${formName}_prefilled_${sim.nom.replace(/\s/g, '_')}_CFE${sim.annee_cfe}.pdf`,
        content: pdfBuffer.toString('base64'),
      })
    } catch (err) {
      console.warn('PDF formulaire skipped:', err)
    }

    // Annexe multi-CFE (si > 3 établissements)
    if (avisCfe.length > 3) {
      try {
        const annexeBuffer = await genererAnnexeCFE({
          avisCfe: simData.avis_cfe,
          nomRedevable: sim.nom,
          anneeCfe: sim.annee_cfe,
        })
        attachments.push({
          filename: `Annexe_CFE_${sim.nom.replace(/\s/g, '_')}_${sim.annee_cfe}.docx`,
          content: annexeBuffer.toString('base64'),
        })
      } catch (err) {
        console.warn('Annexe CFE skipped:', err)
      }
    }

    // Facture
    try {
      const factureBuffer = await genererFacture(sim)
      const commission = Math.round(sim.degrevement_reel * 0.20)
      attachments.push({
        filename: `Facture_RembourseCFE_${sim.nom.replace(/\s/g, '_')}_${sim.annee_cfe}.pdf`,
        content: factureBuffer.toString('base64'),
      })
    } catch (err) {
      console.warn('Facture skipped:', err)
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: sim.email,
      replyTo: 'rembourse.cfe@gmail.com',
      subject,
      html,
      attachments,
    })

    await supabaseAdmin
      .from('simulations')
      .update({ documents_sent: true })
      .eq('id', simulationId)
  }

  return NextResponse.json({ ok: true })
}
