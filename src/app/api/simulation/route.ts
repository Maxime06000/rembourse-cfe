import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabaseAdmin
      .from('simulations')
      .insert([{
        nom: body.nom,
        email: body.email,
        telephone: body.telephone || null,
        siret: body.siret,
        numero_fiscal: body.numeroFiscal,
        reference_avis: body.referenceAvis,
        numero_role: body.numeroRole,
        adresse_bien: body.adresseBien,
        ville: body.ville,
        regime: body.regime,
        type_location: body.typeLocation,
        annee_debut: body.anneeDebut,
        annee_cfe: body.anneeCfe,
        cfe_ligne9_oui: body.cfeLigne9Oui,
        cfe_ligne25: body.cfeLigne25,
        cfe_ligne189: body.cfeLigne189,
        loyers: body.loyers || null,
        charges_externes: body.chargesExternes || 0,
        impots_taxes: body.impotsTaxes || 0,
        amortissements: body.amortissements || 0,
        charges_financieres: body.chargesFinancieres || 0,
        recettes_brutes: body.recettesBrutes || null,
        valeur_ajoutee: body.valeurAjoutee,
        plafonnement: body.plafonnement,
        degrevement_theorique: body.degrevementTheorique,
        degrevement_reel: body.degrevementReel,
        commission: body.commission,
        stripe_payment_status: 'pending',
      }])
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ simulationId: data.id })
  } catch (err) {
    console.error('Save simulation error:', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}
