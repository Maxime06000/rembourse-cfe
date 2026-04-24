import { PDFDocument } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'
import { AvisCfe } from '@/types/avis-cfe'

interface SimulationData {
  nom: string
  siret: string
  adresse_bien: string
  ville: string
  departement: string
  telephone: string | null
  email: string
  reference_avis: string
  numero_role: string
  annee_cfe: number
  // Old single-CFE fields (backward compatibility)
  cfe_ligne25: number
  cfe_ligne189: number
  // New multi-CFE support
  avis_cfe?: AvisCfe[]
  regime: string
  loyers: number | null
  charges_externes: number
  recettes_brutes: number | null
  valeur_ajoutee: number
  plafonnement: number
  degrevement_reel: number
}

function r(n: number): string {
  return Math.round(n).toString()
}

function fill(form: ReturnType<PDFDocument['getForm']>, fieldName: string, value: string) {
  try {
    form.getTextField(fieldName).setText(value)
  } catch {
    // Field not found or value too long — skip silently
  }
}

/**
 * Remplir cadre B - ancien système (1 CFE)
 */
function fillCadreBSingle(form: ReturnType<PDFDocument['getForm']>, sim: SimulationData) {
  fill(form, 'b1', sim.departement || sim.siret.replace(/\s/g, '').substring(0, 2))
  fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'b3', sim.siret.replace(/\s/g, ''))
  fill(form, 'b4', sim.numero_role)
  fill(form, 'b5', r(sim.cfe_ligne25))
  fill(form, 'b22', r(sim.cfe_ligne25))
  fill(form, 'b25a', r(sim.cfe_ligne25))
  fill(form, 'b26', '0')
}

/**
 * Remplir cadre B - nouveau système multi-CFE
 * Max 3 lignes dans le formulaire PDF
 * Si > 3 CFE : mention "voir annexe jointe"
 * 
 * Nommage des champs :
 * Ligne 1 : b1-b7 (colonnes 1-7)
 * Ligne 2 : b8-b14 (colonnes 1-7)
 * Ligne 3 : b15-b21 (colonnes 1-7)
 * 
 * Colonnes à remplir :
 * - Col 1 : Code département
 * - Col 2 : Adresse établissement
 * - Col 3 : N° SIRET
 * - Col 4 : N° de rôle
 * - Col 5 : Montant brut CFE
 * - Col 6 : (vide - ne pas remplir)
 * - Col 7 : (vide - ne pas remplir)
 */
function fillCadreBMulti(form: ReturnType<PDFDocument['getForm']>, avisCfe: AvisCfe[]) {
  const maxLignes = 3
  const totalCfe = avisCfe.reduce((sum, a) => sum + a.montantCfe, 0)
  const principal = avisCfe.find(a => a.estPrincipal)!

  // Remplir jusqu'à 3 lignes
  for (let i = 0; i < Math.min(avisCfe.length, maxLignes); i++) {
    const avis = avisCfe[i]
    const offset = i * 7
    
    // Adresse complète avec ville
    const adresseComplete = avis.commune 
      ? `${avis.adresseEtablissement}, ${avis.commune}`
      : avis.adresseEtablissement
    
    fill(form, `b${1 + offset}`, avis.departement)
    fill(form, `b${2 + offset}`, adresseComplete)
    fill(form, `b${3 + offset}`, avis.siret.replace(/\s/g, ''))
    fill(form, `b${4 + offset}`, avis.numeroRole)
    fill(form, `b${5 + offset}`, r(avis.montantCfe))
  }

  if (avisCfe.length > maxLignes) {
    const remaining = avisCfe.length - maxLignes
    fill(form, 'b_mention', `+ ${remaining} établissement(s) supplémentaire(s) - voir annexe jointe`)
  }

  fill(form, 'b22', r(totalCfe))
  // b24 retiré - causait affichage 356 dans tableau
  fill(form, 'b25a', r(totalCfe))
  fill(form, 'b26', '0')
}


export async function genererPDFFormulaire(sim: SimulationData): Promise<Buffer> {
  const formFile = sim.regime === 'reel' ? '1327-cet-sd.pdf' : '1327-s-cet-sd.pdf'
  const formPath = path.join(process.cwd(), 'public', 'forms', formFile)
  const existingPdfBytes = fs.readFileSync(formPath)
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const form = pdfDoc.getForm()
  const today = new Date().toLocaleDateString('fr-FR')
  const annee = sim.annee_cfe.toString()

  // ── SECTION A — Identification ──
  fill(form, 'a1', sim.nom)
  fill(form, 'a2', 'Location meublée non professionnelle (LMNP)')
  fill(form, 'a3', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'a4', sim.siret.replace(/\s/g, ''))
  fill(form, 'a7', sim.nom)
  fill(form, 'a8', sim.telephone ?? '')
  fill(form, 'a9', sim.email)
  fill(form, 'a10', sim.ville)
  fill(form, 'a11', today)

  if (sim.regime === 'reel') {
    fillReelForm(form, sim, annee)
  } else {
    fillMicroForm(form, sim)
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function fillReelForm(
  form: ReturnType<PDFDocument['getForm']>,
  sim: SimulationData,
  annee: string
) {
  const ca = sim.loyers ?? 0
  const charges = sim.charges_externes
  const va = ca - charges
  const vaRetenue = Math.min(va, ca * 0.8)

  // ── SECTION B — Récapitulation CFE (Multi-établissements) ──
  const avisCfe = sim.avis_cfe && sim.avis_cfe.length > 0 ? sim.avis_cfe : null
  
  if (avisCfe) {
    // Nouveau système multi-CFE
    fillCadreBMulti(form, avisCfe)
  } else {
    // Ancien système (backward compatibility)
    fillCadreBSingle(form, sim)
  }

  // ── SECTION D — Dates exercice ──
  fill(form, 'b27', `01/01/${annee}`)            // DU
  // b28 = AU, déjà pré-rempli avec l'année

  // ── SECTION D-I — Valeur ajoutée ──
  // Dispense de calcul (renvoi ⑦) : on reporte directement depuis le 2033-E
  // Lignes 5 à 14 : uniquement ligne 5 (loyers) et ligne 20 (charges)
  fill(form, 'b29', r(ca))                       // Ligne 5 : loyers encaissés
  fill(form, 'b39', r(ca))                       // 1er TOTAL (lignes 5 à 14)
  fill(form, 'b47', r(charges))                  // Ligne 20 : charges externes
  fill(form, 'b52', r(charges))                  // 2e TOTAL (lignes 15 à 23)
  fill(form, 'b54', r(va))                       // 28a : VA produite
  fill(form, 'b55', r(ca))                       // 28b : CA de référence
  if (va > ca * 0.8) {
    fill(form, 'b56', r(ca * 0.8))              // 28c : si VA > 80% CA
  }
  fill(form, 'b59', r(vaRetenue))               // 28e : VA retenue ← valeur clé

  // ── SECTION E — Calcul du plafonnement ──
  fill(form, 'd1', r(sim.plafonnement))          // Ligne 60

  // Calculer totaux (multi-CFE ou ancien système)
  const totalCfe = avisCfe ? avisCfe.reduce((sum, a) => sum + a.montantCfe, 0) : sim.cfe_ligne25
  const cotisationMin = avisCfe 
    ? avisCfe.find(a => a.estPrincipal)!.cotisationMin 
    : sim.cfe_ligne189

  // ── SECTION F — Dégrèvement demandé ──
  const degrevementBrut = totalCfe - sim.plafonnement
  fill(form, 'd2', r(totalCfe))                  // Ligne 61 gauche
  fill(form, 'd3', r(sim.plafonnement))          // Ligne 61 milieu
  fill(form, 'd4', r(degrevementBrut))           // Ligne 61 résultat

  // ── SECTION G — Limitation du dégrèvement ──
  fill(form, 'd5', r(cotisationMin))             // Ligne 62 : cotisation minimum
  const maxDeg = totalCfe - cotisationMin
  fill(form, 'd6', r(maxDeg))                    // Ligne 63 : max dégrèvement
  fill(form, 'd7', r(Math.min(degrevementBrut, maxDeg))) // Ligne 64 : dégrèvement final
  // Ligne 65 (d7a) : vide
}

function fillMicroForm(
  form: ReturnType<PDFDocument['getForm']>,
  sim: SimulationData
) {
  const recettes = sim.recettes_brutes ?? 0
  const va = sim.valeur_ajoutee

  // Support multi-CFE ou ancien système
  const avisCfe = sim.avis_cfe && sim.avis_cfe.length > 0 ? sim.avis_cfe : null
  const totalCfe = avisCfe ? avisCfe.reduce((sum, a) => sum + a.montantCfe, 0) : sim.cfe_ligne25
  const cotisationMin = avisCfe 
    ? avisCfe.find(a => a.estPrincipal)!.cotisationMin 
    : sim.cfe_ligne189

  // Cadre B
  if (avisCfe) {
    fillCadreBMulti(form, avisCfe)
  } else {
    fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
    fill(form, 'b3', sim.siret.replace(/\s/g, ''))
    fill(form, 'b4', sim.numero_role)
    fill(form, 'b5', r(totalCfe))
  }
  
  fill(form, 'b25', r(totalCfe))
  fill(form, 'b27', r(totalCfe))

  fill(form, 'c1', r(recettes))
  fill(form, 'c2', '0')
  fill(form, 'c7', r(va))
  fill(form, 'c8', r(sim.plafonnement))

  const degrevementBrut = totalCfe - sim.plafonnement
  fill(form, 'c9', r(degrevementBrut))
  fill(form, 'c10', r(cotisationMin))
  const maxDeg = totalCfe - cotisationMin
  fill(form, 'c11', r(maxDeg))
  fill(form, 'c12', r(Math.min(degrevementBrut, maxDeg)))
}
