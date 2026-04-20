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

  // ── SECTION A — Identification (identique pour les deux formulaires) ──
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
    fillReelForm(form, sim)
  } else {
    fillMicroForm(form, sim)
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

function fillReelForm(form: ReturnType<PDFDocument['getForm']>, sim: SimulationData) {
  const ca = sim.loyers ?? 0
  const charges = sim.charges_externes
  const va = sim.valeur_ajoutee           // = ca - charges
  const vaRetenue = Math.min(va, ca * 0.8) // plafond 80% CA si applicable

  // ── SECTION B — Récapitulation CFE établissement principal ──
  fill(form, 'b1', '06')                          // Code département (ex: Nice = 06)
  fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'b3', sim.siret.replace(/\s/g, ''))
  fill(form, 'b4', sim.numero_role)
  fill(form, 'b5', r(sim.cfe_ligne25))             // Montant brut CFE (ligne 25 avis)
  fill(form, 'b25', r(sim.cfe_ligne25))            // TOTAUX colonne 5
  // Ligne 2 : cotisation minimum — laisser vide car on est assujetti
  // Ligne 3 : montant à plafonner = total CFE
  fill(form, 'b43', r(sim.cfe_ligne25))            // Ligne 3 : montant à plafonner

  // Ligne 4 : CVAE = 0 pour LMNP (CA < 152 500 €)
  fill(form, 'b44', '0')

  // ── SECTION D-I — Valeur ajoutée BIC réel ──
  // Produits
  fill(form, 'c1', r(ca))          // Ligne 5 : loyers encaissés (ventes/prestations)
  fill(form, 'c11', r(ca))         // 1er TOTAL (lignes 5 à 14)

  // Charges — les charges externes vont en ligne 20 "Autres charges de gestion courante"
  fill(form, 'c18', r(charges))    // Ligne 20 : autres charges de gestion courante
  fill(form, 'c22', r(charges))    // 2e TOTAL (lignes 15 à 23)

  // VA calculée
  fill(form, 'c23', r(va))         // 28a : VA produite (1er - 2e TOTAL)
  fill(form, 'c24', r(ca))         // 28b : CA de référence

  // 28c : si VA brute > 80% du CA, appliquer le plafond
  if (va > ca * 0.8) {
    fill(form, 'c25', r(ca * 0.8)) // 28c : montant corrigé = CA × 80%
  }

  fill(form, 'c27', r(vaRetenue))  // 28e : VA retenue pour le plafonnement

  // ── SECTION E — Calcul du plafonnement ──
  fill(form, 'c32', r(sim.plafonnement)) // Ligne 60 : plafonnement = VA retenue × 1,531%

  // ── SECTION F — Dégrèvement demandé ──
  // Ligne 61 = (ligne 3 + ligne 4) - ligne 60 = CFE - plafonnement
  const degrevementBrut = sim.cfe_ligne25 - sim.plafonnement
  fill(form, 'c33', r(degrevementBrut)) // Ligne 61

  // ── SECTION G — Limitation du dégrèvement ──
  // L'entreprise est NON assujettie à la cotisation minimum → remplir lignes 62, 63, 64
  fill(form, 'c34', r(sim.cfe_ligne189))                          // Ligne 62 : cotisation minimum
  const maxDeg = sim.cfe_ligne25 - sim.cfe_ligne189
  fill(form, 'c35', r(maxDeg))                                    // Ligne 63 : max dégrèvement
  fill(form, 'c36', r(Math.min(degrevementBrut, maxDeg)))        // Ligne 64 : dégrèvement final
  // Ligne 65 reste vide (réservée aux entreprises ASSUJETTIE à la cot. min)
}

function fillMicroForm(form: ReturnType<PDFDocument['getForm']>, sim: SimulationData) {
  const recettes = sim.recettes_brutes ?? 0
  const va = sim.valeur_ajoutee // = recettes × 80%

  // ── SECTION B — Récapitulation CFE ──
  fill(form, 'b2', `${sim.adresse_bien}, ${sim.ville}`)
  fill(form, 'b3', sim.siret.replace(/\s/g, ''))
  fill(form, 'b4', sim.numero_role)
  fill(form, 'b5', r(sim.cfe_ligne25))
  fill(form, 'b25', r(sim.cfe_ligne25))
  fill(form, 'b27', r(sim.cfe_ligne25))           // Ligne 3 : montant à plafonner

  // ── SECTION C — Valeur ajoutée micro ──
  fill(form, 'c1', r(recettes))    // Ligne 4 : recettes totales
  fill(form, 'c2', '0')            // Ligne 5 : achats = 0
  fill(form, 'c7', r(va))          // Ligne 7 : VA produite (recettes × 80%)

  // ── SECTION D — Plafonnement ──
  fill(form, 'c8', r(sim.plafonnement))   // Ligne 8 : plafonnement

  // ── SECTION E — Dégrèvement ──
  const degrevementBrut = sim.cfe_ligne25 - sim.plafonnement
  fill(form, 'c9', r(degrevementBrut))    // Ligne 9

  // ── SECTION F — Limitation ──
  fill(form, 'c10', r(sim.cfe_ligne189))  // Ligne 10 : cotisation minimum
  const maxDeg = sim.cfe_ligne25 - sim.cfe_ligne189
  fill(form, 'c11', r(maxDeg))            // Ligne 11 : max dégrèvement
  fill(form, 'c12', r(Math.min(degrevementBrut, maxDeg))) // Ligne 12 : dégrèvement final (non assujetti)
}
