import { create } from 'zustand'
import { ResultatSimulation } from './calcul'

export type Step = 'qualification' | 'avis' | 'financier' | 'identite' | 'resultat' | 'paiement' | 'confirmation'

interface SimulationState {
  step: Step
  simulationId: string | null

  // Qualification
  anneeDebut: number | null
  anneeCfe: number
  typeLocation: 'longue' | 'courte' | null
  paraHotellerie: boolean
  regime: 'reel' | 'micro' | null
  caAnneeN2: number | null

  // Avis CFE
  cfeLigne9Oui: boolean
  cfeLigne25: number | null
  cfeLigne189: number | null
  referenceAvis: string
  numeroRole: string

  // Financier réel
  loyers: number | null
  chargesExternes: number
  impotsTaxes: number
  amortissements: number
  chargesFinancieres: number

  // Financier micro
  recettesBrutes: number | null

  // Identité
  nom: string
  email: string
  telephone: string
  siret: string
  numeroFiscal: string
  adresseBien: string
  ville: string

  // Résultat
  resultat: ResultatSimulation | null

  // Actions
  setStep: (step: Step) => void
  setSimulationId: (id: string) => void
  setQualification: (data: Partial<SimulationState>) => void
  setAvisCFE: (data: Partial<SimulationState>) => void
  setFinancier: (data: Partial<SimulationState>) => void
  setIdentite: (data: Partial<SimulationState>) => void
  setResultat: (resultat: ResultatSimulation) => void
  reset: () => void
}

const initialState = {
  step: 'qualification' as Step,
  simulationId: null,
  anneeDebut: null,
  anneeCfe: new Date().getFullYear() - 1,
  typeLocation: null,
  paraHotellerie: false,
  regime: null,
  caAnneeN2: null,
  cfeLigne9Oui: false,
  cfeLigne25: null,
  cfeLigne189: null,
  referenceAvis: '',
  numeroRole: '',
  loyers: null,
  chargesExternes: 0,
  impotsTaxes: 0,
  amortissements: 0,
  chargesFinancieres: 0,
  recettesBrutes: null,
  nom: '',
  email: '',
  telephone: '',
  siret: '',
  numeroFiscal: '',
  adresseBien: '',
  ville: '',
  resultat: null,
}

export const useSimulation = create<SimulationState>(set => ({
  ...initialState,
  setStep: step => set({ step }),
  setSimulationId: id => set({ simulationId: id }),
  setQualification: data => set(data),
  setAvisCFE: data => set(data),
  setFinancier: data => set(data),
  setIdentite: data => set(data),
  setResultat: resultat => set({ resultat }),
  reset: () => set(initialState),
}))
