import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AvisCfe } from '@/types/avis-cfe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Insert simulation
    const { data: simulation, error: simError } = await supabaseAdmin
      .from('simulations')
      .insert([{
        nom: body.nom,
        email: body.email,
        telephone: body.telephone || null,
        siret: body.siret,
        reference_avis: body.referenceAvis,
        numero_role: body.numeroRole,
        adresse_bien: body.adresseBien,
        ville: body.ville,
        departement: body.departement || null,
        regime: body.regime,
        type_location: body.typeLocation,
        annee_debut: body.anneeDebut,
        annee_cfe: body.anneeCfe,
        // Old CFE columns (nullable for backward compatibility)
        cfe_ligne9_oui: body.cfeLigne9Oui || false,
        cfe_ligne25: body.cfeLigne25 || null,
        cfe_ligne189: body.cfeLigne189 || null,
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
        cgv_accepted_at: body.cgvAcceptedAt,
        cgv_version: body.cgvVersion,
        retractation_waived_at: body.retractationWaivedAt,
        disclaimer_accepted_at: body.disclaimerAcceptedAt,
        stripe_payment_status: 'pending',
      }])
      .select('id')
      .single()

    if (simError) throw simError

    const simulationId = simulation.id

    // If new multi-CFE system is used, insert avis_cfe records
    if (body.avisCfe && Array.isArray(body.avisCfe) && body.avisCfe.length > 0) {
      const avisCfeRecords = body.avisCfe.map((avis: AvisCfe) => ({
        simulation_id: simulationId,
        montant_cfe: avis.montantCfe,
        cotisation_min: avis.cotisationMin,
        ligne9: avis.ligne9,
        numero_avis: avis.numeroAvis,
        numero_role: avis.numeroRole,
        departement: avis.departement,
        adresse_etablissement: avis.adresseEtablissement,
        siret: avis.siret,
        est_principal: avis.estPrincipal,
        nom_redevable: avis.nomRedevable || null,
        commune: avis.commune || null,
        lieu_imposition: avis.lieuImposition || null,
      }))

      const { error: avisCfeError } = await supabaseAdmin
        .from('avis_cfe')
        .insert(avisCfeRecords)

      if (avisCfeError) {
        console.error('Error inserting avis_cfe:', avisCfeError)
        // Don't fail the whole request, just log
      }
    }

    return NextResponse.json({ simulationId })
  } catch (err) {
    console.error('Save simulation error:', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}
