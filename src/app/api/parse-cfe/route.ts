import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let fullText = ''

    // Format impots.gouv.fr = ZIP contenant des fichiers .txt
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

    if (!fullText.trim()) {
      return NextResponse.json({
        error: 'Format non reconnu. Téléchargez l\'avis CFE depuis impots.gouv.fr (espace professionnel).'
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

  const siretMatch = text.match(/N°\s*SIRET\s*[:\s]+([\d\s]{14,18})/)
  if (siretMatch) result.siret = siretMatch[1].replace(/\s/g, '')

  const nomMatch = text.match(/N°\s*SIRET\s*[:\s]+[\d\s]+[\r\n]+\s*([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  if (nomMatch) result.nom = nomMatch[1].trim()

  const refMatch = text.match(/R[eé]f[eé]rence de l['']avis\s*[:\s]+([\d\s]{10,25})/)
  if (refMatch) result.referenceAvis = refMatch[1].trim()

  const roleMatch = text.match(/Num[eé]ro de r[ôo]le\s*[:\s]+(\d+)/)
  if (roleMatch) result.numeroRole = roleMatch[1].trim()

  const lieuMatch = text.match(/Lieu d['']imposition\s*[:\s]+\d+[\r\n]+(.+?)(?:[\r\n]|$)/)
  if (lieuMatch) result.adresseBien = lieuMatch[1].trim()

  const villeMatch = text.match(/Commune\s*[:\s]+\d+[\r\n]+([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  if (villeMatch) result.ville = villeMatch[1].trim()

  const fiscalMatch = text.match(/Num[eé]ro fiscal\s*[:\s]+([\d\s]{10,20})/)
  if (fiscalMatch) result.numeroFiscal = fiscalMatch[1].replace(/\s/g, '').trim()

  const ligne9Match = text.match(/9\s*-[^O\n]{0,60}(OUI|NON)/i)
  if (ligne9Match) result.ligne9 = ligne9Match[1].toUpperCase()

  const ligne25Match = text.match(/25\s*-\s*Total de cotisation fonci[eè]re des entreprises\s+([\d\s]+)/)
  if (ligne25Match) result.ligne25 = ligne25Match[1].trim().replace(/\s/g, '')

  const ligne189Match = text.match(/189\s*-.*?(\d+)\s*[\r\n]/)
  if (ligne189Match) result.ligne189 = ligne189Match[1].trim()

  const anneeMatch = text.match(/AVIS D['']IMP[ÔO]T\s+(\d{4})/)
  if (anneeMatch) result.anneeCfe = anneeMatch[1]

  return result
}
