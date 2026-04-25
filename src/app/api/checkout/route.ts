import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })

export async function POST(req: NextRequest) {
  try {
            const { simulationId, commission, degrevementReel, email, nom, anneeCfe, isMulti } = await req.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const palier = isMulti || degrevementReel > 1500 ? 'multi-établissements ou CFE > 1 500 €'
      : commission === 59 ? 'CFE 500 – 1 500 €'
      : 'CFE < 500 €'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Dossier de dégrèvement CFE ${anneeCfe}`,
              description: `Frais de service (${palier}). Formulaire 1327-CET-SD pré-rempli + mail SIE. Dégrèvement estimé : ${degrevementReel.toLocaleString('fr-FR')} €.`,
            },
            unit_amount: Math.round(commission * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/simulateur`,
      metadata: {
        simulationId,
        nom,
        anneeCfe: String(anneeCfe),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}
