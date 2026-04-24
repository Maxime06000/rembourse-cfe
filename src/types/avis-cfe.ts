export interface AvisCfe {
  id: string // UUID pour React keys
  montantCfe: number
  cotisationMin: number
  ligne9: boolean
  numeroAvis: string
  numeroRole: string
  departement: string
  adresseEtablissement: string
  siret: string
  estPrincipal: boolean
  // Données extraites du PDF
  nomRedevable?: string
  commune?: string
  lieuImposition?: string
}

export interface AvisCfeDB {
  id: string
  simulation_id: string
  montant_cfe: number
  cotisation_min: number
  ligne9: boolean
  numero_avis: string
  numero_role: string
  departement: string
  adresse_etablissement: string
  siret: string
  est_principal: boolean
  nom_redevable: string | null
  commune: string | null
  lieu_imposition: string | null
  created_at: string
}
