import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { genererEmailConfirmation } from '@/lib/mail'
import { genererPDFFormulaire } from '@/lib/pdf'
import { genererFacture } from '@/lib/facture'
import { genererAnnexeCFE } from '@/lib/annexe-cfe'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || 'rembourse2026'

export async function POST(req: NextRequest) {
  const { simulationId, token, overrideEmail } = await req.json()

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sim } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('id', simulationId)
    .single()

  if (!sim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Récupérer les avis CFE liés (multi-établissements)
  const { data: avisCfeRows } = await supabaseAdmin
    .from('avis_cfe')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('est_principal', { ascending: false })

  // Mapper vers le format attendu par pdf.ts
  const avis_cfe = (avisCfeRows ?? []).map(a => ({
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

  const simAvecAvis = { ...sim, avis_cfe }

  const { subject, html } = genererEmailConfirmation(simAvecAvis)
  const attachments: Array<{ filename: string; content: string }> = []

  try {
    const pdfBuffer = await genererPDFFormulaire(simAvecAvis)
    const formName = sim.regime === 'reel' ? '1327-CET-SD' : '1327-S-CET-SD'
    attachments.push({
      filename: `${formName}_prefilled_${sim.nom.replace(/\s/g, '_')}_CFE${sim.annee_cfe}.pdf`,
      content: pdfBuffer.toString('base64'),
    })
  } catch (err) {
    console.warn('PDF formulaire skipped:', err)
  }

  try {
    const factureBuffer = await genererFacture(simAvecAvis)
    attachments.push({
      filename: `Facture_RembourseCFE_${sim.nom.replace(/\s/g, '_')}_${sim.annee_cfe}.pdf`,
      content: factureBuffer.toString('base64'),
    })
  } catch (err) {
    console.warn('Facture skipped:', err)
  }

  // Annexe multi-CFE (si > 3 établissements)
  if (avis_cfe.length > 3) {
    try {
      const annexeBuffer = await genererAnnexeCFE({
        avisCfe: avis_cfe,
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

  const destinataire = overrideEmail ?? sim.email
  const prefixSujet = overrideEmail ? '[ADMIN] ' : '[RENVOI] '

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: destinataire,
    replyTo: 'rembourse-cfe@gmail.com',
    subject: `${prefixSujet}${subject}`,
    html,
    attachments,
  })

  return NextResponse.json({ ok: true })
}
