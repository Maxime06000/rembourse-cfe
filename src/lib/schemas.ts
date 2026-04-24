import { z } from 'zod'

export const schemaQualification = z.object({
  anneeDebut: z.number().int().min(2010).max(2030),
  anneeCfe: z.number().int().min(2023).max(2030),
  typeLocation: z.enum(['longue', 'courte']),
  paraHotellerie: z.boolean().optional(),
  regime: z.enum(['reel', 'micro']),
  caAnneeN2: z.number().min(0),
})

export const schemaAvisCFE = z.object({
  cfeLigne9Oui: z.boolean(),
  cfeLigne25: z.number().positive('Le montant CFE doit être positif'),
  cfeLigne189: z.number().positive('La cotisation minimum doit être positive'),
  referenceAvis: z.string().min(1, 'Référence de l\'avis requise'),
  numeroRole: z.string().min(1, 'Numéro de rôle requis'),
})

export const schemaIdentite = z.object({
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  siret: z
    .string()
    .regex(/^\d{14}$/, 'SIRET doit contenir 14 chiffres')
    .transform(v => v.replace(/\s/g, '')),
  numeroFiscal: z.string().min(1, 'Numéro fiscal requis'),
  adresseBien: z.string().min(5, 'Adresse requise'),
  ville: z.string().min(2, 'Ville requise'),
})

export const schemaDonneesReel = z.object({
  loyers: z.number().positive('Loyers requis'),
  chargesExternes: z.number().min(0).default(0),
  impotsTaxes: z.number().min(0).default(0),
  amortissements: z.number().min(0).default(0),
  chargesFinancieres: z.number().min(0).default(0),
})

export const schemaDonneesMicro = z.object({
  recettesBrutes: z.number().positive('Recettes requises'),
})

export const schemaSimulationComplete = schemaIdentite
  .merge(schemaAvisCFE)
  .merge(schemaQualification)
  .and(
    z.union([
      z.object({ regime: z.literal('reel') }).merge(schemaDonneesReel),
      z.object({ regime: z.literal('micro') }).merge(schemaDonneesMicro),
    ])
  )

export type FormQualification = z.infer<typeof schemaQualification>
export type FormAvisCFE = z.infer<typeof schemaAvisCFE>
export type FormIdentite = z.infer<typeof schemaIdentite>
export type FormDonneesReel = z.infer<typeof schemaDonneesReel>
export type FormDonneesMicro = z.infer<typeof schemaDonneesMicro>
