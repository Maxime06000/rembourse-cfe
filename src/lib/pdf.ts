import { PDFDocument } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'

interface SimulationData {
  nom: string
  siret: string
  adresse_bien: string
  ville: string
  telephone: string | null
  email: string
  reference_avis: string
  numero_role: string
  annee_cfe: number
  cfe_ligne25: number
  cfe_ligne189: number
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

  // ── SECTION B — Récapitulation CFE ──
  fill(form, 'b1', sim.siret.replace(/\s/g, '').substring(0, 2)) // Code département
  fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'b3', sim.siret.replace(/\s/g, ''))
  fill(form, 'b4', sim.numero_role)
  fill(form, 'b5', r(sim.cfe_ligne25))          // Col 5 : montant brut CFE
  fill(form, 'b22', r(sim.cfe_ligne25))          // TOTAUX col 5
  // Ligne 2 : cotisation minimum → VIDE
  // Ligne 3 : montant à plafonner = CFE totale
  fill(form, 'b25a', r(sim.cfe_ligne25))         // Ligne 3
  // Ligne 4 : CVAE = 0
  fill(form, 'b26', '0')

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

  // ── SECTION F — Dégrèvement demandé ──
  const degrevementBrut = sim.cfe_ligne25 - sim.plafonnement
  fill(form, 'd2', r(sim.cfe_ligne25))           // Ligne 61 gauche
  fill(form, 'd3', r(sim.plafonnement))          // Ligne 61 milieu
  fill(form, 'd4', r(degrevementBrut))           // Ligne 61 résultat

  // ── SECTION G — Limitation du dégrèvement ──
  fill(form, 'd5', r(sim.cfe_ligne189))          // Ligne 62 : cotisation minimum
  const maxDeg = sim.cfe_ligne25 - sim.cfe_ligne189
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

  fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'b3', sim.siret.replace(/\s/g, ''))
  fill(form, 'b4', sim.numero_role)
  fill(form, 'b5', r(sim.cfe_ligne25))
  fill(form, 'b25', r(sim.cfe_ligne25))
  fill(form, 'b27', r(sim.cfe_ligne25))

  fill(form, 'c1', r(recettes))
  fill(form, 'c2', '0')
  fill(form, 'c7', r(va))
  fill(form, 'c8', r(sim.plafonnement))

  const degrevementBrut = sim.cfe_ligne25 - sim.plafonnement
  fill(form, 'c9', r(degrevementBrut))
  fill(form, 'c10', r(sim.cfe_ligne189))
  const maxDeg = sim.cfe_ligne25 - sim.cfe_ligne189
  fill(form, 'c11', r(maxDeg))
  fill(form, 'c12', r(Math.min(degrevementBrut, maxDeg)))
}
