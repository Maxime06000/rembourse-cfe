'use client'

import { useState } from 'react'
import { useSimulation } from '@/lib/store'
import { verifierFiltres, MESSAGES_ECHEC } from '@/lib/calcul'
import { Field, Select, Input, Callout } from '@/components/FormElements'

const ANNEES_CFE = [2024, 2025]
const ANNEE_COURANTE = new Date().getFullYear()

export function StepQualification() {
  const { setStep, setQualification } = useSimulation()

  const [anneeDebut, setAnneeDebut] = useState<number>(ANNEE_COURANTE - 3)
  const [anneeCfe, setAnneeCfe] = useState<number>(2024)
  const [typeLocation, setTypeLocation] = useState<'longue' | 'courte'>('longue')
  const [paraHotellerie, setParaHotellerie] = useState<boolean>(false)
  const [regime, setRegime] = useState<'reel' | 'micro'>('reel')
  const [caAnneeN2, setCaAnneeN2] = useState<string>('')
  const [erreur, setErreur] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ca = parseFloat(caAnneeN2.replace(',', '.')) || 0

    const filtre = verifierFiltres({
      anneeDebut,
      anneeCfe,
      caAnneeN2: ca,
      paraHotellerie,
      ligne9Oui: false,
    })

    if (filtre && filtre !== 'abattement_50') {
      setErreur(MESSAGES_ECHEC[filtre])
      return
    }

    setErreur(null)
    setQualification({ anneeDebut, anneeCfe, typeLocation, paraHotellerie, regime, caAnneeN2: ca })
    setStep('avis')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Vérification d'éligibilité</h2>

      <div className="grid grid-cols-2 gap-4">
        <Field label="CFE de quelle année ?" required>
          <Select value={anneeCfe} onChange={e => setAnneeCfe(Number(e.target.value))}>
            {ANNEES_CFE.map(a => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Début d'activité LMNP" hint="Année de votre 1ère déclaration" required>
          <Select value={anneeDebut} onChange={e => setAnneeDebut(Number(e.target.value))}>
            {Array.from({ length: 15 }, (_, i) => ANNEE_COURANTE - i - 1).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Régime fiscal" required>
        <div className="grid grid-cols-2 gap-3">
          {(['reel', 'micro'] as const).map(r => (
            <label key={r} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
              regime === r ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
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
        <div className="grid grid-cols-2 gap-3">
          {(['longue', 'courte'] as const).map(t => (
            <label key={t} className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors ${
              typeLocation === t ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input type="radio" name="type" value={t} checked={typeLocation === t} onChange={() => { setTypeLocation(t); setParaHotellerie(false) }} className="text-blue-600" />
              <div>
                <div className="text-sm font-medium text-gray-800">{t === 'longue' ? 'Longue durée' : 'Courte durée'}</div>
                <div className="text-xs text-gray-400">{t === 'longue' ? 'Bail meublé classique' : 'Airbnb, saisonnier'}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      {typeLocation === 'courte' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-800 mb-3">
            Vérification para-hôtellerie
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Proposez-vous au moins 3 de ces 4 services à vos locataires ?
            Petit-déjeuner · Ménage en cours de séjour · Linge fourni · Accueil des locataires
          </p>
          <div className="flex gap-4">
            {[{ v: false, l: 'Non (moins de 3)' }, { v: true, l: 'Oui (3 ou plus)' }].map(opt => (
              <label key={String(opt.v)} className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
                <input type="radio" name="para" checked={paraHotellerie === opt.v} onChange={() => setParaHotellerie(opt.v)} />
                {opt.l}
              </label>
            ))}
          </div>
        </div>
      )}

      <Field label={`Chiffre d'affaires ${anneeCfe - 2} (loyers encaissés)`} hint={`L'année N-2 par rapport à votre CFE ${anneeCfe}`} required>
        <div className="relative">
          <Input
            type="number"
            value={caAnneeN2}
            onChange={e => setCaAnneeN2(e.target.value)}
            placeholder="28 000"
            min="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
        </div>
      </Field>

      {erreur && <Callout type="danger">{erreur}</Callout>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
      >
        Continuer →
      </button>
    </form>
  )
}
