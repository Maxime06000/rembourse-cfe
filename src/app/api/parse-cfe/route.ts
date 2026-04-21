import { NextRequest, NextResponse } from 'next/server'
import { extractCFEData } from '@/lib/pdf-extractor'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let result: Record<string, string> = {}

    // Format 1 : ZIP-based (impots.gouv.fr espace professionnel)
    try {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(buffer)
      const txtFiles = Object.keys(zip.files).filter(f => f.endsWith('.txt')).sort()
      if (txtFiles.length > 0) {
        let fullText = ''
        for (const fname of txtFiles) fullText += await zip.files[fname].async('string') + '\n'
        result = parseCFETextZip(fullText)
      }
    } catch { /* not a zip */ }

    // Format 2 : PDF natif — extraction pure Node.js (zlib built-in uniquement)
    if (Object.keys(result).length === 0) {
      result = extractCFEData(buffer)
      console.log('[parse-cfe] pdf result:', JSON.stringify(result))
    }

    if (!result.ligne25 && !result.ligne189 && !result.referenceAvis) {
      return NextResponse.json({
        error: 'PDF lu mais données non reconnues — remplissez les champs manuellement.'
      }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Parse error:', err)
    return NextResponse.json({ error: 'Impossible de lire ce fichier' }, { status: 400 })
  }
}

function parseCFETextZip(text: string) {
  const result: Record<string, string> = {}

  const siretMatch = text.match(/N°\s*SIRET\s*[:\s]+([\d\s]{10,18})/)
  if (siretMatch) result.siret = siretMatch[1].replace(/\s/g, '').trim()

  const nomZipMatch = text.match(/N°\s*SIRET\s*[:\s]+[\d\s]+[\r\n]+\s*([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  if (nomZipMatch) result.nom = nomZipMatch[1].trim()

  const refMatch = text.match(/R[eé]f[eé]rence de l['']avis\s*[:\s]*([\d\s]{5,25})/)
  if (refMatch) result.referenceAvis = refMatch[1].trim()

  const roleMatch = text.match(/Num[eé]ro de r[ôo]le\s*[:\s]*(\d+)/)
  if (roleMatch) result.numeroRole = roleMatch[1].trim()

  const lieuMatch = text.match(/Lieu d['']imposition\s*[:\s]+\d+[\r\n]+(.+?)(?:[\r\n]|$)/)
  if (lieuMatch) result.adresseBien = lieuMatch[1].trim()

  const villeMatch = text.match(/Commune\s*[:\s]+\d+[\r\n]+([A-ZÉÈÊËÀÂÙ][A-ZÉÈÊËÀÂÙ\s\-]+?)[\r\n]/)
  if (villeMatch) result.ville = villeMatch[1].trim()

  const fiscalMatch = text.match(/Num[eé]ro fiscal\s*[:\s]*([\d\s]{10,20})/)
  if (fiscalMatch) result.numeroFiscal = fiscalMatch[1].replace(/\s/g, '').trim()

  const ligne9Match = text.match(/Imposition sur la base minimum[^O]*(OUI|NON)/i)
    || text.match(/9\s*-[^O\n]{0,60}(OUI|NON)/i)
  if (ligne9Match) result.ligne9 = ligne9Match[1].toUpperCase()

  const ligne25Match = text.match(/Total de cotisation fonci[eè]re des entreprises\s+([\d]+)/)
  if (ligne25Match) result.ligne25 = ligne25Match[1].trim()

  const ligne189Match = text.match(/MINIMUM CFE\s*\([^)]+\)\s*([\d]+)/)
    || text.match(/189\s*-.*?(\d+)\s*[\r\n]/)
  if (ligne189Match) result.ligne189 = ligne189Match[1].trim()

  const anneeMatch = text.match(/AVIS D['']IMP[ÔO]T\s+(\d{4})/)
  if (anneeMatch) result.anneeCfe = anneeMatch[1]

  return result
}
