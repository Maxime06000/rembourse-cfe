'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { TAUX_PLAFONNEMENT } from '@/lib/calcul'

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' €'
}

export function StepResultat() {
  const store = useSimulation()
  const { resultat, anneeCfe, avisCfe, cfeLigne25, cfeLigne189, regime } = store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  if (!resultat) return null

  const taux = TAUX_PLAFONNEMENT[anneeCfe] ?? 1.25

  // Calculer le total CFE (compatible ancien et nouveau système)
  const totalCfe = avisCfe.length > 0
    ? avisCfe.reduce((sum, a) => sum + a.montantCfe, 0)
    : (cfeLigne25 ?? 0)

  // Cotisation min (établissement principal ou ancien système)
  const cotisationMin = avisCfe.length > 0
    ? avisCfe.find(a => a.estPrincipal)?.cotisationMin ?? 0
    : (cfeLigne189 ?? 0)


  async function handlePaiement() {
    setLoading(true)
    setError(null)
    try {
      // Save simulation first
      const saveRes = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Identité
          nom: store.nom,
          email: store.email,
          telephone: store.telephone,
          siret: store.siret,
          adresseBien: store.adresseBien,
          ville: store.ville,
          departement: store.departement,
          // Qualification
          regime: store.regime,
          typeLocation: store.typeLocation,
          anneeDebut: store.anneeDebut,
          anneeCfe: store.anneeCfe,
          // Avis CFE (nouveau système multi-établissements)
          avisCfe: store.avisCfe,
          // Avis CFE (ancien système - backward compatibility)
          referenceAvis: store.referenceAvis || store.avisCfe[0]?.numeroAvis,
          numeroRole: store.numeroRole || store.avisCfe[0]?.numeroRole,
          cfeLigne9Oui: store.cfeLigne9Oui,
          cfeLigne25: store.cfeLigne25,
          cfeLigne189: store.cfeLigne189,
          // Financier
          loyers: store.loyers,
          chargesExternes: store.chargesExternes,
          impotsTaxes: store.impotsTaxes,
          amortissements: store.amortissements,
          chargesFinancieres: store.chargesFinancieres,
          recettesBrutes: store.recettesBrutes,
          // Résultat
          valeurAjoutee: resultat!.valeurAjoutee,
          plafonnement: resultat!.plafonnement,
          degrevementTheorique: resultat!.degrevementTheorique,
          degrevementReel: resultat!.degrevementReel,
          commission: resultat!.commission,
        }),
      })

      const { simulationId } = await saveRes.json()
      store.setSimulationId(simulationId)

      // Create Stripe checkout
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId,
          commission: resultat!.commission,
          degrevementReel: resultat!.degrevementReel,
          email: store.email,
          nom: store.nom,
          anneeCfe,
        }),
      })

      const { url } = await checkoutRes.json()
      window.location.href = url
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (!resultat.eligible) {
    return (
      <div className="space-y-5">
        <h2 className="font-semibold text-gray-900 text-base">Résultat de la simulation</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-400 mb-2">0 €</div>
          <p className="text-sm text-gray-500">Aucun dégrèvement applicable</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          {resultat.messageEchec}
        </div>
        <button
          onClick={() => store.setStep('qualification')}
          className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Recommencer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Votre dégrèvement estimé</h2>

      {/* Main result */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <p className="text-xs font-medium text-green-700 mb-1 uppercase tracking-wide">Dégrèvement estimé CFE {anneeCfe}</p>
        <div className="text-4xl font-bold text-green-800 mb-1">{fmt(resultat.degrevementReel)}</div>
        <p className="text-sm text-green-600">Récupérables sur votre CFE {anneeCfe}</p>
      </div>

      {/* Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Détail du calcul</p>
        {avisCfe.length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
            <p className="text-xs text-blue-700">
              <strong>{avisCfe.length} établissements</strong> — Total CFE = somme de tous les avis
            </p>
          </div>
        )}
        {[
          { label: `CFE totale ${avisCfe.length > 1 ? `(${avisCfe.length} établissements)` : '(ligne 25)'}`, value: fmt(totalCfe) },
          { label: `Valeur ajoutée ${anneeCfe}`, value: fmt(resultat.valeurAjoutee), sub: regime === 'micro' ? '80% des recettes' : 'Art. 1586 sexies CGI' },
          { label: `Plafonnement (${taux}% × VA)`, value: fmt(resultat.plafonnement) },
          { label: 'Dégrèvement théorique', value: fmt(resultat.degrevementTheorique) },
          { label: `Cotisation minimum${avisCfe.length > 1 ? ' (établ. principal)' : ' (plancher)'}`, value: fmt(cotisationMin) },
          { label: 'Dégrèvement réel', value: fmt(resultat.degrevementReel), bold: true },
        ].map(row => (
          <div key={row.label} className={`flex justify-between items-baseline text-sm ${row.bold ? 'font-semibold border-t border-gray-200 pt-2' : ''}`}>
            <span className="text-gray-600">
              {row.label}
              {row.sub && <span className="text-xs text-gray-400 ml-1">({row.sub})</span>}
            </span>
            <span className={row.bold ? 'text-green-700' : 'text-gray-800'}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Tarif fixe */}
      <div className="space-y-2">
        <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4">
          <div>
            <p className="text-sm text-gray-600">Frais de service</p>
            <p className="text-xs text-gray-400">
              {avisCfe.length > 1 ? 'Multi-établissements' : totalCfe > 1500 ? 'CFE > 1 500 €' : totalCfe >= 500 ? 'CFE 500 – 1 500 €' : 'CFE < 500 €'}
            </p>
          </div>
          <span className="text-lg font-semibold text-gray-800">{fmt(resultat.commission)}</span>
        </div>
        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium text-green-800">Votre gain net estimé</p>
            <p className="text-xs text-green-600">Après déduction des frais</p>
          </div>
          <span className="text-xl font-bold text-green-800">{fmt(resultat.gainNet)}</span>
        </div>
      </div>

      {/* Disclaimer avec case à cocher */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800 font-medium mb-2">⚠️ Information importante</p>
        <p className="text-xs text-amber-700 mb-3">
          RembourseCFE est un service d&apos;aide à la rédaction de votre demande de plafonnement CFE.
          Nous ne sommes ni experts-comptables ni avocats fiscalistes. Le document généré est basé
          exclusivement sur les informations que vous avez saisies. L&apos;acceptation de votre demande
          dépend de l&apos;exactitude de vos chiffres et de l&apos;appréciation de l&apos;administration fiscale.{' '}
          <strong>Le paiement du service ne garantit pas l&apos;obtention du dégrèvement.</strong>
        </p>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={e => setDisclaimerAccepted(e.target.checked)}
            className="mt-0.5 accent-amber-600"
          />
          <span className="text-xs text-amber-800 font-medium">
            J&apos;ai lu et j&apos;accepte ces conditions. Je certifie l&apos;exactitude des données saisies.
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* CTA */}
      <button
        onClick={handlePaiement}
        disabled={loading || !disclaimerAccepted}
        className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Redirection...' : `Payer ${fmt(resultat.commission)} et obtenir mon dossier →`}
      </button>

      <p className="text-xs text-center text-gray-400">
        Paiement sécurisé par Stripe · Vous recevrez le formulaire et le mail par email
      </p>

      <button onClick={() => store.setStep('financier')} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
        ← Modifier mes données
      </button>
    </div>
  )
}
