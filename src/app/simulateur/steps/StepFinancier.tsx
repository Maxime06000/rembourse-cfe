'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { Field, Input } from '@/components/FormElements'

export function StepFinancier() {
  const store = useSimulation()
  const { setStep, setFinancier, regime, anneeCfe } = store

  // Init from store
  const [loyers, setLoyers] = useState(store.loyers ? String(store.loyers) : '')
  const [chargesExternes, setChargesExternes] = useState(store.chargesExternes ? String(store.chargesExternes) : '')
  const [recettesBrutes, setRecettesBrutes] = useState(store.recettesBrutes ? String(store.recettesBrutes) : '')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const n = (v: string) => parseFloat(v.replace(',', '.')) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (regime === 'reel' && !loyers) errs.loyers = 'Loyers requis'
    if (regime === 'micro' && !recettesBrutes) errs.recettesBrutes = 'Recettes requises'
    if (Object.keys(errs).length > 0) { setErreurs(errs); return }
    setErreurs({})
    if (regime === 'reel') {
      setFinancier({ loyers: n(loyers), chargesExternes: n(chargesExternes), impotsTaxes: 0, amortissements: 0, chargesFinancieres: 0 })
    } else {
      setFinancier({ recettesBrutes: n(recettesBrutes) })
    }
    setStep('identite')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Données financières {anneeCfe}</h2>
      <p className="text-sm text-gray-500">
        {regime === 'reel' ? `Données de votre exercice ${anneeCfe} issues de la liasse fiscale 2033-B.` : `Recettes brutes déclarées pour ${anneeCfe}.`}
      </p>

      {regime === 'reel' ? (
        <>
          <Field label="Loyers encaissés" hint="2033-B → Produits d'exploitation → Production vendue" required error={erreurs.loyers}>
            <div className="relative">
              <Input type="number" value={loyers} onChange={e => setLoyers(e.target.value)} placeholder="28 268" error={!!erreurs.loyers} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>
          </Field>
          <Field label="Charges externes" hint="2033-B → Charges d'exploitation → Autres charges externes">
            <div className="relative">
              <Input type="number" value={chargesExternes} onChange={e => setChargesExternes(e.target.value)} placeholder="9 663" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>
          </Field>
          {loyers && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              Valeur ajoutée estimée : <strong>{Math.max(0, n(loyers) - n(chargesExternes)).toLocaleString('fr-FR')} €</strong>
              <span className="text-blue-500 text-xs ml-1">(loyers − charges externes)</span>
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="Recettes annuelles brutes" hint={`Loyers déclarés pour ${anneeCfe}`} required error={erreurs.recettesBrutes}>
            <div className="relative">
              <Input type="number" value={recettesBrutes} onChange={e => setRecettesBrutes(e.target.value)} placeholder="18 000" error={!!erreurs.recettesBrutes} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>
          </Field>
          {recettesBrutes && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              Valeur ajoutée : <strong>{Math.round(n(recettesBrutes) * 0.8).toLocaleString('fr-FR')} €</strong>
              <span className="text-blue-500 ml-1 text-xs">(80% des recettes — art. 1647 B sexies CGI)</span>
            </div>
          )}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Au micro-BIC, la VA est toujours égale à 80% des recettes brutes. L'abattement IR (50% ou 30%) n'entre pas dans ce calcul.
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('avis')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ← Retour
        </button>
        <button type="submit" className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
          Continuer →
        </button>
      </div>
    </form>
  )
}
