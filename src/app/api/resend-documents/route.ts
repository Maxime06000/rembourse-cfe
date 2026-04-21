import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { genererEmailConfirmation } from '@/lib/mail'
import { genererPDFFormulaire } from '@/lib/pdf'
import { genererFacture } from '@/lib/facture'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const ADMIN_TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || 'rembourse2026'

export async function POST(req: NextRequest) {
  const { simulationId, token } = await req.json()

  if (token !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sim } = await supabaseAdmin
    .from('simulations')
    .select('*')
    .eq('id', simulationId)
    .single()

  if (!sim) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { subject, html } = genererEmailConfirmation(sim)
  const attachments: Array<{ filename: string; content: string }> = []

  try {
    const pdfBuffer = await genererPDFFormulaire(sim)
    const formName = sim.regime === 'reel' ? '1327-CET-SD' : '1327-S-CET-SD'
    attachments.push({
      filename: `${formName}_prefilled_${sim.nom.replace(/\s/g, '_')}_CFE${sim.annee_cfe}.pdf`,
      content: pdfBuffer.toString('base64'),
    })
  } catch (err) {
    console.warn('PDF formulaire skipped:', err)
  }

  try {
    await genererFacture(sim)
    const factureBuffer = await genererFacture(sim)
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
    replyTo: 'rembourse-cfe@gmail.com',
    subject: `[RENVOI] ${subject}`,
    html,
    attachments,
  })

  return NextResponse.json({ ok: true })
}
