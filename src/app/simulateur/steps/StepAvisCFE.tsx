'use client'

import { useState, useRef } from 'react'
import { useSimulation } from '@/lib/store'
import { MESSAGES_ECHEC } from '@/lib/calcul'
import { Field, Input, Callout } from '@/components/FormElements'

export function StepAvisCFE() {
  const store = useSimulation()
  const { setStep, setAvisCFE, setIdentite, anneeCfe } = store

  // Init from store
  const [ligne9, setLigne9] = useState<boolean>(store.cfeLigne9Oui)
  const [ligne25, setLigne25] = useState(store.cfeLigne25 ? String(store.cfeLigne25) : '')
  const [ligne189, setLigne189] = useState(store.cfeLigne189 ? String(store.cfeLigne189) : '')
  const [referenceAvis, setReferenceAvis] = useState(store.referenceAvis)
  const [numeroRole, setNumeroRole] = useState(store.numeroRole)
  const [adresseBien, setAdresseBien] = useState(store.adresseBien)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError(null); setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-cfe', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || data.error) { setUploadError(data.error || 'Erreur de lecture'); return }

      // Vérifier qu'au moins un champ clé a été extrait
      if (!data.ligne25 && !data.ligne189 && !data.referenceAvis) {
        setUploadError('PDF lu mais données non reconnues — remplissez les champs manuellement.')
        return
      }

      if (data.ligne9 !== undefined) setLigne9(data.ligne9 === 'OUI')
      if (data.ligne25) setLigne25(String(data.ligne25))
      if (data.ligne189) setLigne189(String(data.ligne189))
      if (data.referenceAvis) setReferenceAvis(data.referenceAvis)
      if (data.numeroRole) setNumeroRole(data.numeroRole)
      if (data.adresseBien) setAdresseBien(data.adresseBien)
      if (data.nom || data.siret || data.ville || data.departement) {
        setIdentite({
          ...(data.nom && { nom: data.nom }),
          ...(data.siret && { siret: data.siret }),
          ...(data.ville && { ville: data.ville }),
          ...(data.numeroFiscal && { numeroFiscal: data.numeroFiscal }),
          ...(data.adresseBien && { adresseBien: data.adresseBien }),
          ...(data.departement && { departement: data.departement }),
        })
      }
      setUploadSuccess(true)
    } catch { setUploadError('Erreur réseau, veuillez réessayer') }
    finally { setUploading(false) }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (ligne9) { setErreurs({ ligne9: MESSAGES_ECHEC['ligne9_oui'] }); return }
    const cfe25 = parseFloat(ligne25.replace(',', '.'))
    const cfe189 = parseFloat(ligne189.replace(',', '.'))
    if (!cfe25 || cfe25 <= 0) errs.ligne25 = 'Montant requis'
    if (!cfe189 || cfe189 <= 0) errs.ligne189 = 'Cotisation minimum requise'
    if (!referenceAvis) errs.referenceAvis = 'Référence requise'
    if (!numeroRole) errs.numeroRole = 'Numéro de rôle requis'
    if (!adresseBien.trim()) errs.adresseBien = 'Adresse requise'
    if (Object.keys(errs).length > 0) { setErreurs(errs); return }
    setErreurs({})
    setAvisCFE({ cfeLigne9Oui: ligne9, cfeLigne25: cfe25, cfeLigne189: cfe189, referenceAvis, numeroRole })
    setIdentite({ adresseBien })
    setStep('financier')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Votre avis CFE {anneeCfe}</h2>

      {/* Upload optionnel */}
      <div
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          uploadSuccess ? 'border-green-400 bg-green-50' : 'border-blue-300 bg-blue-50 hover:border-blue-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
        {uploading ? (
          <div className="text-sm text-blue-600 font-medium">⏳ Lecture en cours...</div>
        ) : uploadSuccess ? (
          <div>
            <div className="text-sm text-green-700 font-medium">✅ Avis CFE lu avec succès</div>
            <div className="text-xs text-green-600 mt-1">Champs pré-remplis — vérifiez et corrigez si besoin</div>
          </div>
        ) : (
          <div>
            <div className="text-2xl mb-2">📄</div>
            <div className="text-sm font-medium text-blue-700">Charger mon avis CFE {anneeCfe} <span className="text-blue-400 font-normal">(optionnel)</span></div>
            <div className="text-xs text-blue-500 mt-1">Pré-remplit automatiquement les champs ci-dessous</div>
          </div>
        )}
      </div>

      {uploadError && <Callout type="warning">{uploadError} — Remplissez les champs manuellement.</Callout>}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-600 mb-1.5">Où trouver ces informations sur l'avis ?</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• <strong>Adresse</strong> — cadre "Lieu d'imposition" en haut à gauche</li>
          <li>• <strong>Ligne 9</strong> — "Imposition sur la base minimum" dans le tableau</li>
          <li>• <strong>Ligne 25</strong> — "Total de cotisation foncière des entreprises"</li>
          <li>• <strong>Ligne 189</strong> — "Cotisation minimum CFE" sous le tableau</li>
          <li>• <strong>Référence / Rôle</strong> — cadre "Vos références" en haut à gauche</li>
        </ul>
      </div>

      <Field label="Adresse du bien (lieu d'imposition)" hint="Cadre Lieu d'imposition de l'avis" required error={erreurs.adresseBien}>
        <Input value={adresseBien} onChange={e => setAdresseBien(e.target.value)} placeholder="24B rue Smolett, Nice" error={!!erreurs.adresseBien} />
      </Field>

      <Field label="Ligne 9 — imposition sur base minimum" required>
        <div className="flex gap-4">
          {[{ v: false, l: 'NON' }, { v: true, l: 'OUI' }].map(opt => (
            <label key={String(opt.v)} className={`flex items-center gap-2 text-sm cursor-pointer border rounded-lg px-4 py-2.5 flex-1 justify-center font-medium transition-colors ${
              ligne9 === opt.v ? opt.v ? 'border-red-400 bg-red-50 text-red-700' : 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
              <input type="radio" name="ligne9" checked={ligne9 === opt.v} onChange={() => setLigne9(opt.v)} className="sr-only" />
              {opt.l}
            </label>
          ))}
        </div>
        {erreurs.ligne9 && <p className="text-xs text-red-600 mt-2">{erreurs.ligne9}</p>}
      </Field>

      {ligne9 && <Callout type="danger">{MESSAGES_ECHEC['ligne9_oui']}</Callout>}

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
            <Field label="Référence de l'avis" hint="ex: 25 06 0363284 33" required error={erreurs.referenceAvis}>
              <Input value={referenceAvis} onChange={e => setReferenceAvis(e.target.value)} placeholder="25 06 0363284 33" error={!!erreurs.referenceAvis} />
            </Field>
            <Field label="Numéro de rôle" hint="ex: 092" required error={erreurs.numeroRole}>
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
