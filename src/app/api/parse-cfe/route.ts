import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let fullText = ''

    // Format 1 : ZIP-based (impots.gouv.fr espace professionnel)
    try {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buffer)
      const txtFiles = Object.keys(zip.files).filter(f => f.endsWith('.txt')).sort()
      if (txtFiles.length > 0) {
        for (const fname of txtFiles) {
          fullText += await zip.files[fname].async('string') + '\n'
        }
      }
    } catch { /* not a zip */ }

    // Format 2 : PDF natif via pdfjs-dist
    if (!fullText.trim()) {
      try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs' as string) as any
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          useWorkerFetch: false,
          isEvalSupported: false,
          useSystemFonts: true,
          verbosity: 0,
        }).promise
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
        }
      } catch (e) {
        console.error('pdfjs error:', e)
      }
    }

    if (!fullText.trim()) {
      return NextResponse.json({
        error: 'Format non reconnu. Téléchargez l\'avis CFE depuis impots.gouv.fr.'
      }, { status: 400 })
    }

    return NextResponse.json(parseCFEText(fullText))
  } catch (err) {
    console.error('Parse error:', err)
    return NextResponse.json({ error: 'Impossible de lire ce fichier' }, { status: 400 })
  }
}

function parseCFEText(text: string) {
  const result: Record<string, string> = {}

  const siretMatch = text.match(/N°\s*SIRET\s*[:\s]+([\d\s]{10,18})/)
  if (siretMatch) result.siret = siretMatch[1].replace(/\s/g, '').trim()

  const nomZipMatch = text.match(/N°\s*SIRET\s*[:\s]+[\d\s]+[\r\n]+\s*([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  const nomPdfMatch = text.match(/N°\s*SIRET\s*:\s*[\d\s]+\s+([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)\s+D[eé]partement/)
  if (nomZipMatch) result.nom = nomZipMatch[1].trim()
  else if (nomPdfMatch) result.nom = nomPdfMatch[1].trim()

  const refMatch = text.match(/R[eé]f[eé]rence de l['']avis\s*[:\s]*([\d\s]{5,25})/)
  if (refMatch) result.referenceAvis = refMatch[1].trim()

  const roleMatch = text.match(/Num[eé]ro de r[ôo]le\s*[:\s]*(\d+)/)
  if (roleMatch) result.numeroRole = roleMatch[1].trim()

  const lieuZipMatch = text.match(/Lieu d['']imposition\s*[:\s]+\d+[\r\n]+(.+?)(?:[\r\n]|$)/)
  const lieuPdfMatch = text.match(/Lieu d.imposition\s*:\s*\d+\s+([A-Z0-9][A-Z0-9\s]+?)(?:\s+Vos r|\s+MONTANT|\s+D[eé]part)/)
  if (lieuZipMatch) result.adresseBien = lieuZipMatch[1].trim()
  else if (lieuPdfMatch) result.adresseBien = lieuPdfMatch[1].trim()

  const villeZipMatch = text.match(/Commune\s*[:\s]+\d+[\r\n]+([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  const villePdfMatch = text.match(/Commune\s*:\s*\d+\s+([A-ZÉÈÊËÀÂÙ]+)/)
  if (villeZipMatch) result.ville = villeZipMatch[1].trim()
  else if (villePdfMatch) result.ville = villePdfMatch[1].trim()

  const fiscalMatch = text.match(/Num[eé]ro fiscal\s*[:\s]*([\d\s]{10,20})/)
  if (fiscalMatch) result.numeroFiscal = fiscalMatch[1].replace(/\s/g, '').trim()

  const ligne9Match = text.match(/Imposition sur la base minimum[^O]*(OUI|NON)/i)
    || text.match(/9\s*-[^O\n]{0,60}(OUI|NON)/i)
  if (ligne9Match) result.ligne9 = ligne9Match[1].toUpperCase()

  const ligne25Match = text.match(/Total de cotisation fonci[eè]re des entreprises\s+([\d]+)/)
    || text.match(/25\s*-\s*Total[^0-9]+([\d]+)/)
  if (ligne25Match) result.ligne25 = ligne25Match[1].trim()

  const ligne189Match = text.match(/MINIMUM CFE\s*\([^)]+\)\s*([\d]+)/)
    || text.match(/189\s*-.*?(\d+)\s*[\r\n]/)
  if (ligne189Match) result.ligne189 = ligne189Match[1].trim()

  const anneeMatch = text.match(/AVIS D['']IMP[ÔO]T\s+(\d{4})/)
  if (anneeMatch) result.anneeCfe = anneeMatch[1]

  return result
}
