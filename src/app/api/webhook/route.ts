import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { genererMailSIE, genererEmailConfirmation } from '@/lib/mail'
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

    // Update payment status
    await supabaseAdmin
      .from('simulations')
      .update({
        stripe_session_id: session.id,
        stripe_payment_status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', simulationId)

    // Fetch simulation data
    const { data: sim } = await supabaseAdmin
      .from('simulations')
      .select('*')
      .eq('id', simulationId)
      .single()

    if (!sim) return NextResponse.json({ ok: true })

    // Generate documents
    const mailSIE = genererMailSIE(sim)
    const { subject, html } = genererEmailConfirmation(sim)

    // Send email with mail content as attachment
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'contact@rembourse-cfe.fr',
      to: sim.email,
      subject,
      html,
      attachments: [
        {
          filename: `mail_SIE_CFE_${sim.annee_cfe}_${sim.nom.replace(/\s/g, '_')}.txt`,
          content: Buffer.from(mailSIE).toString('base64'),
        },
      ],
    })

    // Mark documents as sent
    await supabaseAdmin
      .from('simulations')
      .update({ documents_sent: true })
      .eq('id', simulationId)
  }

  return NextResponse.json({ ok: true })
}
