import { PDFDocument, PDFTextField, PDFCheckBox, rgb } from 'pdf-lib'
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

function fmt(n: number): string {
  return Math.round(n).toString()
}

export async function genererPDFFormulaire(sim: SimulationData): Promise<Buffer> {
  const formFile = sim.regime === 'reel' ? '1327-cet-sd.pdf' : '1327-s-cet-sd.pdf'
  const formPath = path.join(process.cwd(), 'public', 'forms', formFile)

  // Load the official PDF
  const existingPdfBytes = fs.readFileSync(formPath)
  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const form = pdfDoc.getForm()

  // Log available fields to help identify them
  const fields = form.getFields()
  console.log('PDF fields:', fields.map(f => ({ name: f.getName(), type: f.constructor.name })))

  // Try to fill known fields - field names may vary, we use try/catch
  const tryFill = (fieldName: string, value: string) => {
    try {
      const field = form.getTextField(fieldName)
      field.setText(value)
    } catch {
      // Field not found or wrong type - skip silently
    }
  }

  // Section A - Identification
  tryFill('nom', sim.nom)
  tryFill('Dénomination ou nom et prénom', sim.nom)
  tryFill('denomination', sim.nom)
  tryFill('adresse', `${sim.adresse_bien}, ${sim.ville}`)
  tryFill('Adresse du principal établissement', `${sim.adresse_bien}, ${sim.ville}`)
  tryFill('siret', sim.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4'))
  tryFill('Numéro SIRET de l\'établissement principal', sim.siret)
  tryFill('activite', 'Location meublée non professionnelle (LMNP)')
  tryFill('Activités exercées', 'Location meublée non professionnelle (LMNP)')

  // Section D - Valeur ajoutée
  if (sim.regime === 'reel') {
    tryFill('loyers', fmt(sim.loyers ?? 0))
    tryFill('Production vendue', fmt(sim.loyers ?? 0))
    tryFill('charges_externes', fmt(sim.charges_externes))
    tryFill('Services extérieurs', fmt(sim.charges_externes))
    tryFill('valeur_ajoutee', fmt(sim.valeur_ajoutee))
    tryFill('28a', fmt(sim.valeur_ajoutee))
    tryFill('28b', fmt(sim.loyers ?? 0))
    tryFill('28e', fmt(sim.valeur_ajoutee))
  } else {
    tryFill('recettes', fmt(sim.recettes_brutes ?? 0))
    tryFill('valeur_ajoutee', fmt(sim.valeur_ajoutee))
  }

  // Section E - Plafonnement
  tryFill('plafonnement', fmt(sim.plafonnement))
  tryFill('60', fmt(sim.plafonnement))

  // Section F - Dégrèvement demandé
  tryFill('degrevement', fmt(sim.degrevement_reel))
  tryFill('61', fmt(sim.degrevement_reel))
  tryFill('64', fmt(sim.degrevement_reel))
  tryFill('65', fmt(sim.degrevement_reel))

  // Section G - Cotisation minimum
  tryFill('cotisation_minimum', fmt(sim.cfe_ligne189))
  tryFill('62', fmt(sim.cfe_ligne189))

  // Section B - CFE
  tryFill('cfe_montant', fmt(sim.cfe_ligne25))

  // Signature area
  const today = new Date().toLocaleDateString('fr-FR')
  tryFill('ville_date', `${sim.ville}, le ${today}`)
  tryFill('lieu', sim.ville)
  tryFill('date', today)
  tryFill('telephone', sim.telephone ?? '')
  tryFill('email', sim.email)
  tryFill('Téléphone', sim.telephone ?? '')
  tryFill('Adresse électronique', sim.email)

  // Flatten form to prevent further editing (keep signature field editable)
  // Don't flatten so user can still sign
  // form.flatten()

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
