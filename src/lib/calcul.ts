import { AvisCfe } from '@/types/avis-cfe'

export const TAUX_PLAFONNEMENT: Record<number, number> = {
  2023: 1.625,
  2024: 1.531,
  2025: 1.438,
  2026: 1.438,
  2027: 1.438,
  2028: 1.438,
  2029: 1.344,
}
const TAUX_DEFAULT = 1.25 // 2030+

/**
 * Commission = 20% du dégrèvement réel, bornée entre 39€ et 99€
 */
export function calculerTarif(degrevementReel: number): number {
  const commission = Math.round(degrevementReel * 0.2)
  return Math.min(99, Math.max(39, commission))
}

export type Regime = 'reel' | 'micro'

export interface DonneesReel {
  loyers: number
  chargesExternes: number
  impotsTaxes: number
  amortissements: number
  chargesFinancieres: number
}

export interface DonneesMicro {
  recettesBrutes: number
}

export interface ResultatSimulation {
  valeurAjoutee: number
  valeurAjouteeRetenue: number
  plafonnement: number
  degrevementTheorique: number
  degrevementReel: number
  commission: number
  gainNet: number
  taux: number
  eligible: boolean
  messageEchec?: string
}

export type FiltreEchec =
  | 'exonere_premiere_annee'
  | 'abattement_50'
  | 'ca_inferieur_5000'
  | 'para_hotellerie'
  | 'ligne9_oui'
  | null

export function verifierFiltres(params: {
  anneeDebut: number
  anneeCfe: number
  caAnneeN2: number
  paraHotellerie: boolean
  ligne9Oui: boolean
}): FiltreEchec {
  const { anneeDebut, anneeCfe, caAnneeN2, paraHotellerie, ligne9Oui } = params
  const diff = anneeCfe - anneeDebut

  if (diff <= 0) return 'exonere_premiere_annee'
  if (diff === 1) return 'abattement_50'
  if (caAnneeN2 > 0 && caAnneeN2 <= 5000) return 'ca_inferieur_5000'
  if (paraHotellerie) return 'para_hotellerie'
  if (ligne9Oui) return 'ligne9_oui'
  return null
}

export const MESSAGES_ECHEC: Record<FiltreEchec & string, string> = {
  exonere_premiere_annee:
    "Votre activité a débuté l'année de la CFE réclamée — vous étiez exonéré cette année-là. Aucun dégrèvement applicable.",
  abattement_50:
    "C'est la deuxième année de votre activité : votre base d'imposition était réduite de 50%. Le potentiel de dégrèvement est très limité.",
  ca_inferieur_5000:
    "Avec un chiffre d'affaires inférieur à 5 000 €, vous êtes normalement exonéré de cotisation minimum. Si vous avez reçu un avis CFE, contactez directement votre Service des Impôts des Entreprises (SIE) — il s'agit probablement d'une erreur.",
  para_hotellerie:
    "Votre activité relève probablement de la para-hôtellerie (3 services ou plus fournis). Ce cas est hors périmètre de notre service. Nous vous recommandons de consulter un expert-comptable.",
  ligne9_oui:
    "Votre CFE est intégralement calculée sur la base minimum (ligne 9 = OUI). Le plafonnement par la valeur ajoutée ne s'applique pas à la cotisation minimum. Aucun dégrèvement n'est possible.",
}

export function calculerVAReelle(donnees: DonneesReel): number {
  // Conformément aux instructions de l'administration fiscale :
  // VA = Loyers encaissés - Charges externes uniquement
  return donnees.loyers - donnees.chargesExternes
}

export function calculerVAMicro(donnees: DonneesMicro): number {
  return donnees.recettesBrutes * 0.8
}

export function calculerDegrevement(params: {
  regime: Regime
  donnees: DonneesReel | DonneesMicro
  cfeLigne25: number
  cfeLigne189: number
  anneeCfe: number
}): ResultatSimulation {
  const { regime, donnees, cfeLigne25, cfeLigne189, anneeCfe } = params

  const taux = TAUX_PLAFONNEMENT[anneeCfe] ?? TAUX_DEFAULT
  const ca =
    regime === 'reel'
      ? (donnees as DonneesReel).loyers
      : (donnees as DonneesMicro).recettesBrutes

  const vaBase =
    regime === 'reel'
      ? calculerVAReelle(donnees as DonneesReel)
      : calculerVAMicro(donnees as DonneesMicro)

  // Plafond 80% du CA
  const vaRetenue = Math.min(vaBase, ca * 0.8)

  const plafonnement = Math.round(vaRetenue * (taux / 100))
  const degrevementTheorique = Math.round(cfeLigne25 - plafonnement)
  const plancher = Math.round(cfeLigne25 - cfeLigne189)
  const degrevementReel = Math.max(0, Math.min(degrevementTheorique, plancher))

  const commission = calculerTarif(degrevementReel)
  const gainNet = degrevementReel - commission

  return {
    valeurAjoutee: Math.round(vaBase),
    valeurAjouteeRetenue: Math.round(vaRetenue),
    plafonnement,
    degrevementTheorique,
    degrevementReel,
    commission,
    gainNet,
    taux,
    eligible: degrevementReel > 0,
    messageEchec: degrevementReel <= 0
      ? "Votre CFE ne dépasse pas le plafond légal. Aucun dégrèvement n'est applicable."
      : undefined,
  }
}

/**
 * Calculer le dégrèvement pour multi-établissements (plusieurs avis CFE)
 * 
 * Règle : 
 * - Total CFE = somme de tous les montants CFE
 * - Cotisation min = celle de l'établissement principal uniquement
 * - Le calcul se fait au niveau entreprise (1 VA globale)
 */
export function calculerDegrevementMultiCFE(params: {
  regime: Regime
  donnees: DonneesReel | DonneesMicro
  avisCfe: AvisCfe[]
  anneeCfe: number
}): ResultatSimulation {
  const { regime, donnees, avisCfe, anneeCfe } = params

  if (avisCfe.length === 0) {
    throw new Error('Aucun avis CFE fourni')
  }

  // Calculer le total CFE (somme de tous les établissements)
  const totalCfe = avisCfe.reduce((sum, avis) => sum + avis.montantCfe, 0)

  // Cotisation minimum = celle de l'établissement principal uniquement
  const etablissementPrincipal = avisCfe.find(a => a.estPrincipal)
  if (!etablissementPrincipal) {
    throw new Error('Aucun établissement principal défini')
  }
  const cotisationMin = etablissementPrincipal.cotisationMin

  // Appeler la fonction de calcul classique avec les totaux
  return calculerDegrevement({
    regime,
    donnees,
    cfeLigne25: totalCfe,
    cfeLigne189: cotisationMin,
    anneeCfe,
  })
}

