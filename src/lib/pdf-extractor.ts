import zlib from 'zlib'

export function extractCFEData(buffer: Buffer): Record<string, string> {
  const raw = buffer.toString('binary')
  const pieces: string[] = []

  // Decompress all FlateDecode streams and extract (text) Tj strings
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match
  while ((match = streamRegex.exec(raw)) !== null) {
    let decompressed: string | null = null
    try {
      const sd = Buffer.from(match[1], 'binary')
      try { decompressed = zlib.inflateSync(sd).toString('latin1') } catch {
        try { decompressed = zlib.inflateRawSync(sd).toString('latin1') } catch { /* skip */ }
      }
    } catch { /* skip */ }
    if (!decompressed) continue

    const tjRegex = /\(([^)]*)\)\s*Tj/g
    let t
    while ((t = tjRegex.exec(decompressed)) !== null) {
      const str = t[1]
        .replace(/\\(\d{3})/g, (_m, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\')
        .trim()
      if (str) pieces.push(str)
    }
  }

  const text = pieces.join(' ')
  const result: Record<string, string> = {}

  // SIRET: 9+5 digit pattern
  const siretMatch = text.match(/(\d{9}\s*\d{5})/)
  if (siretMatch) result.siret = siretMatch[1].replace(/\s/g, '')

  // Nom: between SIRET value and "Dép"
  const nomMatch = text.match(/\d{9}\s*\d{5}\s+([A-Z][A-Z\s\-]+?)\s+D\s*[ée]/i)
  if (nomMatch) result.nom = nomMatch[1].trim()

  // Référence avis: XX XX XXXXXXX XX
  const refMatch = text.match(/(\d{2}\s+\d{2}\s+\d{7}\s+\d{2})/)
  if (refMatch) result.referenceAvis = refMatch[1].trim()

  // Numéro de rôle
  const roleMatch = text.match(/[rR]\s*[ôoÔO]\s*l\s*e\s*:\s*(\d+)/)
    || text.match(/ole\s*:\s*(\d+)/)
  if (roleMatch) result.numeroRole = roleMatch[1].trim()

  // Adresse: after lieu d'imposition code (4 digits), before "V o s" pattern
  const adresseMatch = text.match(/:\s*\d{4}\s+([\dA-Z].*?)\s+V\s+[a-z]/i)
  if (adresseMatch) result.adresseBien = adresseMatch[1].trim()

  // Ville: after "Commune :" or "C o m m u n e :"
  const villeMatch = text.match(/[Cc]\s*o\s*m\s*m\s*u\s*n\s*e\s*:\s*\d+\s+([A-Z][A-Z\s\-]+?)(?:\s+Lieu|L\s*i\s*e\s*u)/i)
  if (villeMatch) result.ville = villeMatch[1].replace(/\s+/g, ' ').trim()

  // Département: after "D é p a r t e m e n t :"
  const deptMatch = text.match(/[Dd]\s*[éè]\s*p\s*a\s*r\s*t\s*e\s*m\s*e\s*n\s*t\s*:\s*(\d{2,3})/i)
  if (deptMatch) result.departement = deptMatch[1].trim()

  // Numéro fiscal (same as SIRET for LMNP)
  result.numeroFiscal = result.siret || ''

  // Ligne 9: OUI ou NON
  const ligne9Match = text.match(/\(3\s*\\\s*(NON|OUI)/i)
    || text.match(/\b(NON|OUI)\b/)
  if (ligne9Match) result.ligne9 = ligne9Match[1].toUpperCase()

  // Ligne 25: CFE totale = montant IMPÔT ou PAYER
  const ligne25Match = text.match(/IMP[^0-9]{0,10}T\s+([\d]{3,5}),/i)
    || text.match(/PAYER\s+([\d]{3,5}),/)
  if (ligne25Match) result.ligne25 = ligne25Match[1].trim()

  // Ligne 189: cotisation minimum — après "( 28" (le \( du PDF devient ( après décompression)
  const ligne189Match = text.match(/\(\s*2\s*8\s+([\d]{3,4})/)
  if (ligne189Match) result.ligne189 = ligne189Match[1].trim()

  // Année: depuis le code document (VXXXXXX2025) ou la date de paiement
  const anneeMatch = text.match(/\d{6}(20[0-9]{2})\s+5\s+O/)
    || text.match(/\d{2}\/\d{2}\/(20[0-9]{2})/)
  if (anneeMatch) result.anneeCfe = anneeMatch[1]

  return result
}
