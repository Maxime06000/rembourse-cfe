'use client'

import { useState, useEffect } from 'react'
import { useSimulation } from '@/lib/store'
import { calculerDegrevement, calculerDegrevementMultiCFE } from '@/lib/calcul'
import { Field, Input, Callout } from '@/components/FormElements'

export function StepIdentite() {
  const store = useSimulation()
  const { setStep, setIdentite, setResultat, regime, avisCfe } = store

  // Récupérer l'établissement principal
  const etablissementPrincipal = avisCfe.find(a => a.estPrincipal)

  const [nom, setNom] = useState(store.nom)
  const [email, setEmail] = useState(store.email)
  const [telephone, setTelephone] = useState(store.telephone)
  
  // Utiliser l'établissement principal si store est vide
  const [siret, setSiret] = useState(() => {
    return store.siret && store.siret.trim() !== '' 
      ? store.siret 
      : (etablissementPrincipal?.siret || '')
  })
  const [numeroFiscal, setNumeroFiscal] = useState(store.numeroFiscal)
  const [adresseBien, setAdresseBien] = useState(() => {
    return store.adresseBien && store.adresseBien.trim() !== '' 
      ? store.adresseBien 
      : (etablissementPrincipal?.adresseEtablissement || '')
  })
  const [ville, setVille] = useState(() => {
    return store.ville && store.ville.trim() !== '' 
      ? store.ville 
      : (etablissementPrincipal?.commune || '')
  })
  const [erreurs, setErreurs] = useState<Record<string, string>>({})

  // Mettre à jour quand l'établissement principal change
  useEffect(() => {
    if (etablissementPrincipal) {
      // Ne mettre à jour que si le champ local est vide
      if (!siret || siret.trim() === '') {
        setSiret(etablissementPrincipal.siret || '')
      }
      if (!ville || ville.trim() === '') {
        setVille(etablissementPrincipal.commune || '')
      }
      if (!adresseBien || adresseBien.trim() === '') {
        setAdresseBien(etablissementPrincipal.adresseEtablissement || '')
      }
    }
  }, [etablissementPrincipal?.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}

    if (!nom.trim()) errs.nom = 'Nom requis'
    if (!email.includes('@')) errs.email = 'Email invalide'
    if (siret.replace(/\s/g, '').length !== 14) errs.siret = 'SIRET doit contenir 14 chiffres'
    if (!numeroFiscal.trim()) errs.numeroFiscal = 'Numéro fiscal requis'
    if (!adresseBien.trim()) errs.adresseBien = 'Adresse requise'
    if (!ville.trim()) errs.ville = 'Ville requise'

    if (Object.keys(errs).length > 0) { setErreurs(errs); return }

    setErreurs({})
    setIdentite({ nom, email, telephone, siret: siret.replace(/\s/g, ''), numeroFiscal, adresseBien, ville })

    const donnees = regime === 'reel'
      ? {
          loyers: store.loyers ?? 0,
          chargesExternes: store.chargesExternes,
          impotsTaxes: store.impotsTaxes,
          amortissements: store.amortissements,
          chargesFinancieres: store.chargesFinancieres,
        }
      : { recettesBrutes: store.recettesBrutes ?? 0 }

    // Utiliser le nouveau système multi-CFE si disponible, sinon ancien système
    const resultat = store.avisCfe.length > 0
      ? calculerDegrevementMultiCFE({
          regime: regime!,
          donnees,
          avisCfe: store.avisCfe,
          anneeCfe: store.anneeCfe,
        })
      : calculerDegrevement({
          regime: regime!,
          donnees,
          cfeLigne25: store.cfeLigne25 ?? 0,
          cfeLigne189: store.cfeLigne189 ?? 0,
          anneeCfe: store.anneeCfe,
        })

    setResultat(resultat)
    setStep('resultat')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="font-semibold text-gray-900 text-base">Vos coordonnées</h2>
      <p className="text-sm text-gray-500">Ces informations seront utilisées pour préremplir votre dossier de réclamation.</p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom complet" required error={erreurs.nom}>
          <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Maxime Lescouzeres" error={!!erreurs.nom} />
        </Field>
        <Field label="Email" required error={erreurs.email}>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="maxime@email.com" error={!!erreurs.email} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Téléphone" hint="Optionnel">
          <Input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="06 47 69 63 82" />
        </Field>
        <Field label="N° SIRET" hint="14 chiffres" required error={erreurs.siret}>
          <Input value={siret} onChange={e => setSiret(e.target.value)} placeholder="842 659 450 00014" error={!!erreurs.siret} />
        </Field>
      </div>

      <Field label="Numéro fiscal" hint="Cadre 'Vos références' de l'avis CFE" required error={erreurs.numeroFiscal}>
        <Input value={numeroFiscal} onChange={e => setNumeroFiscal(e.target.value)} placeholder="842659450 00014" error={!!erreurs.numeroFiscal} />
      </Field>

      <Field label="Adresse du bien (établissement principal)" required error={erreurs.adresseBien}>
        <Input value={adresseBien} onChange={e => setAdresseBien(e.target.value)} placeholder="24B rue Smolett" error={!!erreurs.adresseBien} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Ville" required error={erreurs.ville}>
          <Input value={ville} onChange={e => setVille(e.target.value)} placeholder="Nice" error={!!erreurs.ville} />
        </Field>
      </div>

      <Callout type="info">
        Vos données sont utilisées uniquement pour générer votre dossier de réclamation. Elles ne sont pas partagées avec des tiers.
      </Callout>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => setStep('financier')} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
          ← Retour
        </button>
        <button type="submit" className="flex-[2] bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
          Calculer mon dégrèvement →
        </button>
      </div>
    </form>
  )
}
