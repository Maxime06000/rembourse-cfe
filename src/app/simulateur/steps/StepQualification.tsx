'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { verifierFiltres, MESSAGES_ECHEC } from '@/lib/calcul'
import { Field, Select, Input, Callout } from '@/components/FormElements'

const ANNEE_COURANTE = new Date().getFullYear()
const ANNEE_CFE = ANNEE_COURANTE - 1

export function StepQualification() {
  const store = useSimulation()
  const { setStep, setQualification } = store

  const ANNEE_SEUIL = ANNEE_CFE - 2 // 2022 pour CFE 2024

  // Initialise depuis le store si déjà rempli
  const [activiteAvantSeuil, setActiviteAvantSeuil] = useState<boolean>(true)
  const [typeLocation, setTypeLocation] = useState<'longue' | 'courte' | 'courte_para'>(
    store.typeLocation === 'courte' ? 'courte' : store.typeLocation === 'longue' ? 'longue' : 'longue'
  )
  const [regime, setRegime] = useState<'reel' | 'micro'>(store.regime ?? 'reel')
  const [erreur, setErreur] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!activiteAvantSeuil) {
      setErreur(`Votre activité a débuté après ${ANNEE_SEUIL}. Vous bénéficiez d'une exonération (1ère année) ou d'un abattement de 50% (2e année). Le plafonnement CFE n'est pas applicable dans votre cas.`)
      return
    }

    if (typeLocation === 'courte_para') {
      setErreur(MESSAGES_ECHEC['para_hotellerie'])
      return
    }

    setErreur(null)
    setQualification({ 
      anneeDebut: ANNEE_SEUIL, 
      anneeCfe: ANNEE_CFE, 
      typeLocation: typeLocation === 'courte' ? 'courte' : 'longue', 
      paraHotellerie: false, 
      regime, 
      caAnneeN2: 0 
    })
    setStep('avis')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Vérification d'éligibilité</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="text-2xl font-bold text-blue-700">{ANNEE_CFE}</div>
        <div>
          <p className="text-sm font-medium text-blue-800">CFE {ANNEE_CFE} — année traitée</p>
          <p className="text-xs text-blue-600">Délai de réclamation : avant le 31/12/{ANNEE_COURANTE}</p>
        </div>
      </div>

      <Field label="Ancienneté de l'activité" required>
        <div className="grid grid-cols-1 gap-3">
          {[
            { v: true, title: `Oui, activité commencée en ${ANNEE_SEUIL} ou avant`, sub: 'Éligible au plafonnement CFE' },
            { v: false, title: `Non, activité commencée après ${ANNEE_SEUIL}`, sub: 'Exonération ou abattement de 50% applicable' },
          ].map(opt => (
            <label key={String(opt.v)} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
              activiteAvantSeuil === opt.v ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="annee" 
                checked={activiteAvantSeuil === opt.v} 
                onChange={() => { setActiviteAvantSeuil(opt.v); setErreur(null) }} 
                className="text-blue-600 mt-0.5" 
              />
              <div>
                <div className="text-sm font-medium text-gray-800">{opt.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Régime fiscal" required>
        <div className="grid grid-cols-2 gap-3">
          {(['reel', 'micro'] as const).map(r => (
            <label key={r} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${regime === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="regime" value={r} checked={regime === r} onChange={() => setRegime(r)} className="text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">{r === 'reel' ? 'Régime réel' : 'Micro-BIC'}</div>
                <div className="text-xs text-gray-400">{r === 'reel' ? 'Liasse 2031/2033-B' : 'Abattement forfaitaire'}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <Field label="Type de location" required>
        <div className="grid grid-cols-1 gap-3">
          {[
            { v: 'longue', title: 'Longue durée', sub: 'Bail meublé classique (> 1 mois)', color: 'blue' },
            { v: 'courte', title: 'Courte durée', sub: 'Airbnb, saisonnier, location à la nuitée', color: 'blue' },
            { v: 'courte_para', title: 'Courte durée — para-hôtellerie', sub: 'Vous fournissez au moins 3 services parmi : petit-déjeuner, ménage en cours de séjour, linge de maison, accueil', color: 'amber' },
          ].map(t => (
            <label key={t.v} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
              typeLocation === t.v ? t.color === 'amber' ? 'border-amber-400 bg-amber-50' : 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input type="radio" name="type" value={t.v} checked={typeLocation === t.v} onChange={() => { setTypeLocation(t.v as typeof typeLocation); setErreur(null) }} className="text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-800">{t.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{t.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      {typeLocation === 'courte_para' && (
        <Callout type="warning">Votre activité relève de la para-hôtellerie. Ce service ne couvre pas ce cas — nous vous recommandons de consulter un expert-comptable.</Callout>
      )}

      {erreur && <Callout type="danger">{erreur}</Callout>}

      {typeLocation !== 'courte_para' && (
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
          Continuer →
        </button>
      )}
    </form>
  )
}
