import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

interface SimulationData {
  nom: string
  siret: string
  adresse_bien: string
  ville: string
  email: string
  annee_cfe: number
  degrevement_reel: number
}

// Helper pour formater les nombres sans espace insécable
function formatMontant(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function numeroFacture(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `RCF-${yy}${mm}${dd}-${rand}`
}

export async function genererFacture(sim: SimulationData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const blue = rgb(0.11, 0.3, 0.87)
  const dark = rgb(0.1, 0.1, 0.1)
  const gray = rgb(0.5, 0.5, 0.5)
  const lightGray = rgb(0.95, 0.95, 0.95)

  const now = new Date()
  const today = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
  const numFacture = numeroFacture()
  const commission = Math.round(sim.degrevement_reel * 0.20)

  // ── En-tête ──
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: blue })
  page.drawText('RembourseCFE', { x: 40, y: height - 45, size: 22, font: fontBold, color: rgb(1,1,1) })
  page.drawText('Votre assistant de dégrèvement CFE', { x: 40, y: height - 65, size: 10, font, color: rgb(0.8,0.9,1) })
  page.drawText('FACTURE', { x: width - 140, y: height - 48, size: 20, font: fontBold, color: rgb(1,1,1) })

  // ── Infos facture ──
  let y = height - 120
  page.drawText(`N° ${numFacture}`, { x: 40, y, size: 11, font: fontBold, color: dark })
  page.drawText(`Date : ${today}`, { x: 350, y, size: 10, font, color: dark })

  // ── Émetteur ──
  y -= 40
  page.drawText('Émetteur', { x: 40, y, size: 9, font: fontBold, color: gray })
  y -= 18
  page.drawText('RembourseCFE', { x: 40, y, size: 11, font: fontBold, color: dark })
  y -= 16
  page.drawText('Service d\'assistance au dégrèvement CFE', { x: 40, y, size: 10, font, color: dark })
  y -= 14
  page.drawText('rembourse-cfe@gmail.com', { x: 40, y, size: 10, font, color: blue })
  y -= 14
  page.drawText('rembourse-cfe-eight.vercel.app', { x: 40, y, size: 10, font, color: blue })

  // ── Client ──
  const clientX = 320
  let yClient = height - 160
  page.drawText('Facturé à', { x: clientX, y: yClient, size: 9, font: fontBold, color: gray })
  yClient -= 18
  page.drawText(sim.nom, { x: clientX, y: yClient, size: 11, font: fontBold, color: dark })
  yClient -= 16
  page.drawText(`SIRET : ${sim.siret}`, { x: clientX, y: yClient, size: 10, font, color: dark })
  yClient -= 14
  page.drawText(`${sim.adresse_bien}`, { x: clientX, y: yClient, size: 10, font, color: dark })
  yClient -= 14
  page.drawText(sim.ville, { x: clientX, y: yClient, size: 10, font, color: dark })
  yClient -= 14
  page.drawText(sim.email, { x: clientX, y: yClient, size: 10, font, color: dark })

  // ── Ligne séparatrice ──
  y = Math.min(y, yClient) - 30
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 1, color: rgb(0.85,0.85,0.85) })

  // ── Tableau prestations ──
  y -= 30
  // En-tête tableau
  page.drawRectangle({ x: 40, y: y - 7, width: width - 80, height: 32, color: blue })
  page.drawText('Description', { x: 50, y: y + 8, size: 10, font: fontBold, color: rgb(1,1,1) })
  page.drawText('Montant', { x: width - 120, y: y + 8, size: 10, font: fontBold, color: rgb(1,1,1) })

  // Ligne prestation
  y -= 30
  page.drawRectangle({ x: 40, y: y - 8, width: width - 80, height: 44, color: lightGray })
  page.drawText(`Génération du dossier de dégrèvement CFE ${sim.annee_cfe}`, { x: 50, y: y + 12, size: 10, font: fontBold, color: dark })
  page.drawText(`Commission 20% sur dégrèvement estimé de ${formatMontant(sim.degrevement_reel)} €`, { x: 50, y: y - 2, size: 9, font, color: gray })
  page.drawText(`${formatMontant(commission)} €`, { x: width - 120, y: y + 12, size: 11, font: fontBold, color: dark })

  // ── Total ──
  y -= 50
  page.drawLine({ start: { x: 40, y: y + 10 }, end: { x: width - 40, y: y + 10 }, thickness: 1, color: rgb(0.85,0.85,0.85) })
  page.drawText('TVA non applicable — art. 293B du CGI', { x: 50, y, size: 9, font, color: gray })
  page.drawText('TOTAL TTC', { x: width - 200, y, size: 12, font: fontBold, color: dark })
  page.drawText(`${formatMontant(commission)} €`, { x: width - 110, y, size: 14, font: fontBold, color: blue })

  // ── Mentions légales ──
  y -= 60
  page.drawLine({ start: { x: 40, y: y + 10 }, end: { x: width - 40, y: y + 10 }, thickness: 0.5, color: rgb(0.9,0.9,0.9) })
  y -= 10
  page.drawText('Paiement effectué par carte bancaire via Stripe.', { x: 40, y, size: 8, font, color: gray })
  y -= 14
  page.drawText('Cette facture est émise suite au paiement confirmé de la commission RembourseCFE.', { x: 40, y, size: 8, font, color: gray })

  y -= 20
  page.drawText('Contact : rembourse-cfe@gmail.com', { x: 40, y, size: 9, font, color: blue })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
