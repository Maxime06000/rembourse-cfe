'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { MESSAGES_ECHEC } from '@/lib/calcul'
import { Field, Input, Callout } from '@/components/FormElements'

export function StepAvisCFE() {
  const { setStep, setAvisCFE, anneeCfe } = useSimulation()

  const [ligne9, setLigne9] = useState<boolean>(false)
  const [ligne25, setLigne25] = useState('')
  const [ligne189, setLigne189] = useState('')
  const [referenceAvis, setReferenceAvis] = useState('')
  const [numeroRole, setNumeroRole] = useState('')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (ligne9) {
      setErreurs({ ligne9: MESSAGES_ECHEC['ligne9_oui'] })
      return
    }

    const cfe25 = parseFloat(ligne25.replace(',', '.'))
    const cfe189 = parseFloat(ligne189.replace(',', '.'))

    if (!cfe25 || cfe25 <= 0) errs.ligne25 = 'Montant requis'
    if (!cfe189 || cfe189 <= 0) errs.ligne189 = 'Cotisation minimum requise'
    if (!referenceAvis) errs.referenceAvis = 'Référence requise'
    if (!numeroRole) errs.numeroRole = 'Numéro de rôle requis'

    if (Object.keys(errs).length > 0) { setErreurs(errs); return }

    setErreurs({})
    setAvisCFE({
      cfeLigne9Oui: ligne9,
      cfeLigne25: cfe25,
      cfeLigne189: cfe189,
      referenceAvis,
      numeroRole,
    })
    setStep('financier')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Votre avis CFE {anneeCfe}</h2>
      <p className="text-sm text-gray-500">Retrouvez ces informations dans le cadre "Éléments de calcul" de votre avis d'imposition.</p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-800 mb-2">Où trouver ces informations ?</p>
        <ul className="text-xs text-blue-700 space-y-1.5">
          <li>• <strong>Ligne 9</strong> — "Imposition sur la base minimum" (Oui/Non) — tableau "Éléments de calcul" de l'avis</li>
          <li>• <strong>Ligne 25</strong> — "Total de cotisation foncière des entreprises" — bas du tableau</li>
          <li>• <strong>Ligne 189</strong> — "Information : cotisation minimum CFE" — sous le tableau</li>
          <li>• <strong>Référence de l'avis</strong> — cadre "Vos références" en haut à gauche de l'avis (ex : 25 06 0363284 33)</li>
          <li>• <strong>Numéro de rôle</strong> — cadre "Vos références" en haut à gauche, ligne "Numéro de rôle" (ex : 092)</li>
        </ul>
      </div>

      <Field label="Ligne 9 — imposition sur base minimum" required>
        <div className="flex gap-4">
          {[{ v: false, l: 'NON' }, { v: true, l: 'OUI' }].map(opt => (
            <label key={String(opt.v)} className={`flex items-center gap-2 text-sm cursor-pointer border rounded-lg px-4 py-2.5 flex-1 justify-center font-medium transition-colors ${
              ligne9 === opt.v
                ? opt.v ? 'border-red-400 bg-red-50 text-red-700' : 'border-green-400 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
              <input type="radio" name="ligne9" checked={ligne9 === opt.v} onChange={() => setLigne9(opt.v)} className="sr-only" />
              {opt.l}
            </label>
          ))}
        </div>
        {erreurs.ligne9 && <p className="text-xs text-red-600 mt-2">{erreurs.ligne9}</p>}
      </Field>

      {ligne9 && (
        <Callout type="danger">{MESSAGES_ECHEC['ligne9_oui']}</Callout>
      )}

      {!ligne9 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ligne 25 — CFE totale" hint="Montant de votre avis" required error={erreurs.ligne25}>
              <div className="relative">
                <Input type="number" value={ligne25} onChange={e => setLigne25(e.target.value)} placeholder="922" error={!!erreurs.ligne25} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              </div>
            </Field>
            <Field label="Ligne 189 — cotisation minimum" hint="Plancher du dégrèvement" required error={erreurs.ligne189}>
              <div className="relative">
                <Input type="number" value={ligne189} onChange={e => setLigne189(e.target.value)} placeholder="356" error={!!erreurs.ligne189} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Référence de l'avis" hint='Cadre "Vos références" — ex: 25 06 0363284 33' required error={erreurs.referenceAvis}>
              <Input value={referenceAvis} onChange={e => setReferenceAvis(e.target.value)} placeholder="25 06 0363284 33" error={!!erreurs.referenceAvis} />
            </Field>
            <Field label="Numéro de rôle" hint='Cadre "Vos références" — ex: 092' required error={erreurs.numeroRole}>
              <Input value={numeroRole} onChange={e => setNumeroRole(e.target.value)} placeholder="092" error={!!erreurs.numeroRole} />
            </Field>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('qualification')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ← Retour
        </button>
        {!ligne9 && (
          <button type="submit" className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
            Continuer →
          </button>
        )}
      </div>
    </form>
  )
}
