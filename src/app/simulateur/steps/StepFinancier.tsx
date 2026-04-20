'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { Field, Input } from '@/components/FormElements'

export function StepFinancier() {
  const { setStep, setFinancier, regime, anneeCfe } = useSimulation()

  const [loyers, setLoyers] = useState('')
  const [chargesExternes, setChargesExternes] = useState('')
  const [impotsTaxes, setImpotsTaxes] = useState('')
  const [amortissements, setAmortissements] = useState('')
  const [chargesFinancieres, setChargesFinancieres] = useState('')
  const [recettesBrutes, setRecettesBrutes] = useState('')
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
      setFinancier({
        loyers: n(loyers),
        chargesExternes: n(chargesExternes),
        impotsTaxes: n(impotsTaxes),
        amortissements: n(amortissements),
        chargesFinancieres: n(chargesFinancieres),
      })
    } else {
      setFinancier({ recettesBrutes: n(recettesBrutes) })
    }
    setStep('identite')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">
        Données financières {anneeCfe}
      </h2>
      <p className="text-sm text-gray-500">
        {regime === 'reel'
          ? `Saisissez les données de votre exercice ${anneeCfe} (liasse 2033-B).`
          : `Saisissez vos recettes brutes déclarées pour l'année ${anneeCfe}.`}
      </p>

      {regime === 'reel' ? (
        <>
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produits</p>
            <Field label="Loyers encaissés" hint="Production vendue — 2033-B" required error={erreurs.loyers}>
              <div className="relative">
                <Input type="number" value={loyers} onChange={e => setLoyers(e.target.value)} placeholder="28 268" error={!!erreurs.loyers} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              </div>
            </Field>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Charges</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Charges externes" hint="Gestion, entretien, assurance…">
                <div className="relative">
                  <Input type="number" value={chargesExternes} onChange={e => setChargesExternes(e.target.value)} placeholder="9 663" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Impôts et taxes" hint="CFE incluse — 2033-B">
                <div className="relative">
                  <Input type="number" value={impotsTaxes} onChange={e => setImpotsTaxes(e.target.value)} placeholder="4 672" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Amortissements" hint="Dotations aux amortissements">
                <div className="relative">
                  <Input type="number" value={amortissements} onChange={e => setAmortissements(e.target.value)} placeholder="12 779" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
              <Field label="Intérêts d'emprunt" hint="Charges financières — 2033-B">
                <div className="relative">
                  <Input type="number" value={chargesFinancieres} onChange={e => setChargesFinancieres(e.target.value)} placeholder="2 414" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
                </div>
              </Field>
            </div>
          </div>

          {loyers && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              VA estimée :{' '}
              <strong>
                {Math.max(0,
                  n(loyers) - n(chargesExternes) - n(impotsTaxes) - n(amortissements) - n(chargesFinancieres)
                ).toLocaleString('fr-FR')} €
              </strong>
            </div>
          )}
        </>
      ) : (
        <>
          <Field label="Recettes annuelles brutes" hint={`Loyers déclarés pour ${anneeCfe} — case 5ND ou 5NG de votre 2042-C-PRO`} required error={erreurs.recettesBrutes}>
            <div className="relative">
              <Input type="number" value={recettesBrutes} onChange={e => setRecettesBrutes(e.target.value)} placeholder="18 000" error={!!erreurs.recettesBrutes} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>
          </Field>

          {recettesBrutes && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              VA calculée automatiquement :{' '}
              <strong>{Math.round(n(recettesBrutes) * 0.8).toLocaleString('fr-FR')} €</strong>
              <span className="text-blue-500 ml-1">(80% des recettes)</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Au micro-BIC, la valeur ajoutée est toujours égale à 80% des recettes brutes (art. 1647 B sexies du CGI).
            L'abattement forfaitaire IR de 50% ou 30% n'entre pas dans ce calcul.
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('avis')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ← Retour
        </button>
        <button type="submit" className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
          Voir le résultat →
        </button>
      </div>
    </form>
  )
}
