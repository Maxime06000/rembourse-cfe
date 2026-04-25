'use client'

import { useState, useRef } from 'react'
import { useSimulation } from '@/lib/store'
import { AvisCfe } from '@/types/avis-cfe'
import { MESSAGES_ECHEC } from '@/lib/calcul'
import { Field, Input, Callout } from '@/components/FormElements'

export function StepAvisCFE() {
  const store = useSimulation()
  const { setStep, avisCfe, addAvisCfe, removeAvisCfe, updateAvisCfe, setPrincipal, setIdentite, anneeCfe } = store

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [erreurValidation, setErreurValidation] = useState<string | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state pour saisie manuelle/édition
  const [formData, setFormData] = useState({
    montantCfe: '',
    cotisationMin: '',
    numeroAvis: '',
    numeroRole: '',
    departement: '',
    adresseEtablissement: '',
    commune: '',
    siret: '',
  })

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    setUploadError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/parse-cfe', { method: 'POST', body: formData })
      const data = await res.json()
      
      if (!res.ok || data.error) {
        setUploadError(data.error || 'Erreur de lecture du PDF')
        return
      }

      // Vérifier qu'au moins les champs essentiels ont été extraits
      if (!data.ligne25 && !data.ligne189) {
        setUploadError('PDF lu mais données CFE non reconnues — ajoutez manuellement.')
        return
      }

      // Vérifier ligne 9 - bloquer si OUI
      if (data.ligne9 === 'OUI') {
        setUploadError(MESSAGES_ECHEC['ligne9_oui'])
        return
      }

      // Créer un nouvel avis CFE
      const nouvelAvis: AvisCfe = {
        id: crypto.randomUUID(),
        montantCfe: parseFloat(data.ligne25) || 0,
        cotisationMin: parseFloat(data.ligne189) || 0,
        ligne9: data.ligne9 === 'OUI',
        numeroAvis: data.referenceAvis || '',
        numeroRole: data.numeroRole || '',
        departement: data.departement || '',
        adresseEtablissement: data.adresseBien || data.lieuImposition || '',
        siret: data.siret || '',
        estPrincipal: avisCfe.length === 0, // Le premier est principal par défaut
        nomRedevable: data.nom || '',
        commune: data.ville || '',
        lieuImposition: data.lieuImposition || '',
      }

      addAvisCfe(nouvelAvis)

      // Si c'est le premier avis, pré-remplir l'identité
      if (avisCfe.length === 0 && (data.nom || data.siret || data.ville)) {
        setIdentite({
          ...(data.nom && { nom: data.nom }),
          ...(data.siret && { siret: data.siret }),
          ...(data.ville && { ville: data.ville }),
          ...(data.numeroFiscal && { numeroFiscal: data.numeroFiscal }),
          ...(data.departement && { departement: data.departement }),
        })
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
      
    } catch (err) {
      setUploadError('Erreur réseau, veuillez réessayer')
    } finally {
      setUploading(false)
    }
  }

  function handleOpenManualForm() {
    setFormData({
      montantCfe: '',
      cotisationMin: '',
      numeroAvis: '',
      numeroRole: '',
      departement: '',
      adresseEtablissement: '',
      commune: '',
      siret: '',
    })
    setEditingId(null)
    setShowManualForm(true)
  }

  function handleEditAvis(avis: AvisCfe) {
    setFormData({
      montantCfe: String(avis.montantCfe),
      cotisationMin: String(avis.cotisationMin),
      numeroAvis: avis.numeroAvis,
      numeroRole: avis.numeroRole,
      departement: avis.departement,
      adresseEtablissement: avis.adresseEtablissement,
      commune: avis.commune || '',
      siret: avis.siret,
    })
    setEditingId(avis.id)
    setShowManualForm(true)
  }

  function handleSaveManual() {
    // Validation
    if (!formData.montantCfe || !formData.cotisationMin || !formData.siret || !formData.commune) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    const avisData = {
      montantCfe: parseFloat(formData.montantCfe.replace(',', '.')),
      cotisationMin: parseFloat(formData.cotisationMin.replace(',', '.')),
      numeroAvis: formData.numeroAvis,
      numeroRole: formData.numeroRole,
      departement: formData.departement,
      adresseEtablissement: formData.adresseEtablissement,
      commune: formData.commune,
      siret: formData.siret,
      ligne9: false,
    }

    if (editingId) {
      // Mode édition
      updateAvisCfe(editingId, avisData)
    } else {
      // Mode ajout
      const nouvelAvis: AvisCfe = {
        id: crypto.randomUUID(),
        ...avisData,
        estPrincipal: avisCfe.length === 0,
        nomRedevable: '',
        lieuImposition: '',
      }
      addAvisCfe(nouvelAvis)
    }

    setShowManualForm(false)
    setEditingId(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation
    if (avisCfe.length === 0) {
      setErreurValidation('Veuillez ajouter au moins un avis CFE')
      return
    }

    const principaux = avisCfe.filter(a => a.estPrincipal)
    if (principaux.length === 0) {
      setErreurValidation('Veuillez sélectionner un établissement principal')
      return
    }
    if (principaux.length > 1) {
      setErreurValidation('Un seul établissement principal autorisé')
      return
    }

    // Vérifier que tous les avis ont les champs requis
    const avisIncomplet = avisCfe.find(a => !a.montantCfe || !a.cotisationMin || !a.commune)
    if (avisIncomplet) {
      setErreurValidation('Tous les avis doivent avoir un montant CFE, cotisation min et commune')
      return
    }

    setErreurValidation(null)
    setStep('financier')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Avis de CFE {anneeCfe}</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>Multi-établissements :</strong> Si vous avez reçu plusieurs avis CFE (biens dans différentes communes), ajoutez-les tous ici. Vous devrez marquer l'un d'eux comme établissement principal.
        </p>
      </div>

      {/* Upload zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="space-y-3">
          <div className="text-sm text-gray-600 text-center">
            Ajoutez un avis CFE de 2 façons :
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Upload PDF */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                {uploading ? 'Extraction...' : '📄 Upload PDF'}
              </button>
            </div>

            {/* Saisie manuelle */}
            <button
              type="button"
              onClick={handleOpenManualForm}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
            >
              ✏️ Saisie manuelle
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Le PDF sera analysé automatiquement • Vous pourrez modifier les données après
          </div>
        </div>

        {uploadError && (
          <Callout type="danger">
            {uploadError}
          </Callout>
        )}
      </div>

      {/* Formulaire modal pour saisie manuelle / édition */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Modifier l\'avis CFE' : 'Ajouter un avis CFE manuellement'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Montant CFE (ligne 25)" required>
                  <Input
                    type="number"
                    value={formData.montantCfe}
                    onChange={e => setFormData({ ...formData, montantCfe: e.target.value })}
                  />
                </Field>
                <Field label="Cotisation minimum (ligne 189)" required>
                  <Input
                    type="number"
                    value={formData.cotisationMin}
                    onChange={e => setFormData({ ...formData, cotisationMin: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="N° SIRET" required>
                  <Input
                    value={formData.siret}
                    onChange={e => setFormData({ ...formData, siret: e.target.value })}
                  />
                </Field>
                <Field label="Département" required hint="2 chiffres (ex: 06)">
                  <Input
                    value={formData.departement}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                      setFormData({ ...formData, departement: val })
                    }}
                    maxLength={3}
                  />
                </Field>
              </div>

              <Field label="Adresse de l'établissement" required>
                <Input
                  value={formData.adresseEtablissement}
                  onChange={e => setFormData({ ...formData, adresseEtablissement: e.target.value })}
                />
              </Field>

              <Field label="Commune" required>
                <Input
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                />
              </Field>

              <Field label="N° de rôle">
                <Input
                  value={formData.numeroRole}
                  onChange={e => setFormData({ ...formData, numeroRole: e.target.value })}
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowManualForm(false); setEditingId(null) }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveManual}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des avis CFE */}
      {avisCfe.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Avis CFE ajoutés ({avisCfe.length})</h3>
          </div>

          {avisCfe.map((avis) => (
            <div
              key={avis.id}
              className={`border rounded-lg p-4 ${avis.estPrincipal ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="principal"
                        checked={avis.estPrincipal}
                        onChange={() => setPrincipal(avis.id)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {avis.estPrincipal ? '⭐ Établissement principal' : 'Établissement secondaire'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Montant CFE :</span>{' '}
                      <strong>{avis.montantCfe.toLocaleString('fr-FR')} €</strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Cotisation min :</span>{' '}
                      <strong>{avis.cotisationMin.toLocaleString('fr-FR')} €</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">SIRET :</span>{' '}
                      <span className="font-mono text-xs">{avis.siret || 'Non renseigné'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Adresse :</span>{' '}
                      <span className="text-gray-800">{avis.adresseEtablissement || 'Non renseignée'}</span>
                    </div>
                    {avis.commune && (
                      <div>
                        <span className="text-gray-500">Commune :</span> {avis.commune}
                      </div>
                    )}
                    {avis.departement && (
                      <div>
                        <span className="text-gray-500">Département :</span> {avis.departement}
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-gray-500">Référence avis :</span>{' '}
                      <span className="font-mono text-xs">{avis.siret}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => handleEditAvis(avis)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAvisCfe(avis.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ✕ Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <strong>Total CFE :</strong> {avisCfe.reduce((sum, a) => sum + a.montantCfe, 0).toLocaleString('fr-FR')} €
          </div>
        </div>
      )}

      {erreurValidation && (
        <Callout type="danger">
          {erreurValidation}
        </Callout>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => setStep('qualification')}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          ← Retour
        </button>
        <button
          type="submit"
          className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Continuer →
        </button>
      </div>
    </form>
  )
}
