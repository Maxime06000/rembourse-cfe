import { Document, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, BorderStyle } from 'docx'
import { Packer } from 'docx'
import { AvisCfe } from '@/types/avis-cfe'

/**
 * Générer une annexe Word récapitulative pour les simulations multi-CFE
 * Utilisée quand > 3 établissements (formulaire PDF limité à 3 lignes)
 */
export async function genererAnnexeCFE(params: {
  avisCfe: AvisCfe[]
  nomRedevable: string
  anneeCfe: number
}): Promise<Buffer> {
  const { avisCfe, nomRedevable, anneeCfe } = params

  const totalCfe = avisCfe.reduce((sum, a) => sum + a.montantCfe, 0)
  const principal = avisCfe.find(a => a.estPrincipal)

  const doc = new Document({
    sections: [{
      children: [
        // Titre
        new Paragraph({
          text: `ANNEXE — Récapitulatif des établissements CFE ${anneeCfe}`,
          heading: 'Heading1',
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Sous-titre
        new Paragraph({
          children: [
            new TextRun({ text: 'Redevable : ', bold: true }),
            new TextRun(nomRedevable)
          ],
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: `Nombre d'établissements : `, bold: true }),
            new TextRun(String(avisCfe.length))
          ],
          spacing: { after: 400 }
        }),

        // Table récapitulative
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Dept.', bold: true, color: 'FFFFFF' })] })],
                  shading: { fill: '4472C4' },
                  width: { size: 8, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Adresse établissement', bold: true, color: 'FFFFFF' })] })],
                  shading: { fill: '4472C4' },
                  width: { size: 35, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'SIRET', bold: true, color: 'FFFFFF' })] })],
                  shading: { fill: '4472C4' },
                  width: { size: 17, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'N° rôle', bold: true, color: 'FFFFFF' })] })],
                  shading: { fill: '4472C4' },
                  width: { size: 12, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Montant CFE', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
                  shading: { fill: '4472C4' },
                  width: { size: 13, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Cotis. min', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.RIGHT })],
                  shading: { fill: '4472C4' },
                  width: { size: 10, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Principal', bold: true, color: 'FFFFFF' })], alignment: AlignmentType.CENTER })],
                  shading: { fill: '4472C4' },
                  width: { size: 5, type: WidthType.PERCENTAGE }
                }),
              ]
            }),

            // Data rows
            ...avisCfe.map(avis => new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(avis.departement)] }),
                new TableCell({ children: [new Paragraph(avis.adresseEtablissement || avis.commune || '')] }),
                new TableCell({ children: [new Paragraph(avis.siret)] }),
                new TableCell({ children: [new Paragraph(avis.numeroRole)] }),
                new TableCell({ 
                  children: [new Paragraph({ 
                    text: `${Math.round(avis.montantCfe).toLocaleString('fr-FR')} €`,
                    alignment: AlignmentType.RIGHT 
                  })] 
                }),
                new TableCell({ 
                  children: [new Paragraph({ 
                    text: `${Math.round(avis.cotisationMin).toLocaleString('fr-FR')} €`,
                    alignment: AlignmentType.RIGHT 
                  })] 
                }),
                new TableCell({ 
                  children: [new Paragraph({ 
                    text: avis.estPrincipal ? '⭐' : '',
                    alignment: AlignmentType.CENTER 
                  })] 
                }),
              ]
            })),

            // Total row
            new TableRow({
              children: [
                new TableCell({ 
                  children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true })] })],
                  columnSpan: 4,
                  shading: { fill: 'E7E6E6' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: `${Math.round(totalCfe).toLocaleString('fr-FR')} €`,
                      bold: true 
                    })],
                    alignment: AlignmentType.RIGHT 
                  })],
                  shading: { fill: 'E7E6E6' }
                }),
                new TableCell({ 
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: principal ? `${Math.round(principal.cotisationMin).toLocaleString('fr-FR')} €` : '',
                      bold: true 
                    })],
                    alignment: AlignmentType.RIGHT 
                  })],
                  shading: { fill: 'E7E6E6' }
                }),
                new TableCell({ 
                  children: [new Paragraph('')],
                  shading: { fill: 'E7E6E6' }
                }),
              ]
            })
          ],
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 },
          }
        }),

        // Note explicative
        new Paragraph({
          text: '',
          spacing: { before: 400 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: 'Note : ', bold: true, italics: true }),
            new TextRun({ 
              text: `Ce document récapitule l'ensemble de vos ${avisCfe.length} établissements soumis à la CFE ${anneeCfe}. L'établissement marqué d'une étoile (⭐) est l'établissement principal dont la cotisation minimum est utilisée pour le calcul du plafonnement.`,
              italics: true,
              size: 20 
            })
          ],
          spacing: { before: 200 }
        })
      ]
    }]
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
