import { AvisCfe } from '@/types/avis-cfe'

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
  avis_cfe?: AvisCfe[]
  regime: string
  loyers: number | null
  charges_externes: number
  recettes_brutes: number | null
  valeur_ajoutee: number
  plafonnement: number
  degrevement_reel: number
}

export function genererMailSIE(sim: SimulationData): string {
  const today = new Date().toLocaleDateString('fr-FR')
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €'

  const lignesFinancier = sim.regime === 'reel'
    ? `Éléments de calcul de la valeur ajoutée ${sim.annee_cfe} (déclaration 2033-B) :
  - Loyers encaissés (production vendue) : ${fmt(sim.loyers ?? 0)}
  - Charges externes : ${fmt(sim.charges_externes)}
  - Valeur ajoutée produite : ${fmt(sim.valeur_ajoutee)}`
    : `Éléments de calcul de la valeur ajoutée ${sim.annee_cfe} (régime micro-BIC) :
  - Recettes annuelles brutes : ${fmt(sim.recettes_brutes ?? 0)}
  - Valeur ajoutée retenue (80% des recettes) : ${fmt(sim.valeur_ajoutee)}`

  return `Objet : Réclamation — Demande de plafonnement CFE en fonction de la valeur ajoutée — Exercice ${sim.annee_cfe}

À l'attention du Service des Impôts des Entreprises,

${sim.nom}
SIRET : ${sim.siret}
Adresse du bien : ${sim.adresse_bien}, ${sim.ville}
${sim.telephone ? `Tél : ${sim.telephone} | ` : ''}Email : ${sim.email}

À ${sim.ville}, le ${today}

Madame, Monsieur,

Par la présente, je formule une réclamation conformément aux dispositions de l'article 1647 B sexies du Code général des impôts, afin de solliciter le plafonnement de ma Cotisation Foncière des Entreprises (CFE) en fonction de la valeur ajoutée produite par mon activité au cours de l'exercice ${sim.annee_cfe}.

Je joins à cette réclamation :
  - ${sim.avis_cfe && sim.avis_cfe.length > 1 ? `Les copies de mes ${sim.avis_cfe.length} avis d'imposition CFE ${sim.annee_cfe}` : `La copie de mon avis d'imposition CFE ${sim.annee_cfe}`}
  - Le formulaire ${sim.regime === 'reel' ? '1327-CET-SD' : '1327-S-CET-SD'} dûment complété et signé${sim.avis_cfe && sim.avis_cfe.length > 3 ? '\n  - L\'annexe récapitulative de mes établissements (format Word)' : ''}

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes respectueuses salutations.

${sim.nom}`
}

export function genererEmailConfirmation(sim: SimulationData): { subject: string; html: string } {
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €'
  const mailSIE = genererMailSIE(sim)
  // Escape HTML characters in the mail content
  const mailEscape = mailSIE
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')

  return {
    subject: `Votre dossier de dégrèvement CFE ${sim.annee_cfe} — RembourseCFE`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color: #333; background: #f9fafb;">

  <div style="background: #1d4ed8; color: white; padding: 24px 28px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">RembourseCFE</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Votre dossier de dégrèvement CFE ${sim.annee_cfe} est prêt</p>
  </div>

  <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-right: 1px solid #dcfce7; border-bottom: 1px solid #dcfce7; padding: 20px 28px;">
    <p style="margin: 0 0 4px; font-size: 13px; color: #166534; font-weight: 500;">Dégrèvement estimé</p>
    <p style="margin: 0; font-size: 36px; font-weight: 800; color: #14532d;">${fmt(sim.degrevement_reel)}</p>
  </div>

  <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 8px 8px;">

    <h2 style="font-size: 16px; margin: 0 0 20px; color: #111;">Que faire maintenant ?</h2>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #1e3a8a;">Étape 1 — Copiez le mail ci-dessous et envoyez-le à votre SIE</p>
      <p style="margin: 0; font-size: 13px; color: #3730a3;">Connectez-vous sur <strong>impots.gouv.fr</strong> → Espace professionnel → Messagerie sécurisée → CFE/CVAE → Je formule une réclamation. Copiez-collez le texte ci-dessous.</p>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; font-family: monospace; font-size: 12px; color: #334155; line-height: 1.7;">
      ${mailEscape}
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 16px 20px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Étape 2 — Signez le formulaire officiel joint</p>
      <p style="margin: 0; font-size: 13px; color: #555;">Le formulaire ${sim.regime === 'reel' ? '1327-CET-SD' : '1327-S-CET-SD'} pré-rempli est joint à cet email en pièce jointe PDF. <strong>Signez-le avant de l'envoyer.</strong>${sim.avis_cfe && sim.avis_cfe.length > 3 ? '<br><br><strong>⚠️ Multi-établissements :</strong> Vous avez ' + sim.avis_cfe.length + ' établissements. Une annexe récapitulative (fichier .docx) est jointe. Ajoutez-la à votre envoi.' : ''}</p>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Étape 3 — Joignez vos pièces justificatives</p>
      <p style="margin: 0; font-size: 13px; color: #555;">Ajoutez en pièces jointes : ${sim.avis_cfe && sim.avis_cfe.length > 1 ? 'tous vos avis CFE ' + sim.annee_cfe : 'votre avis CFE ' + sim.annee_cfe}${sim.regime === 'reel' ? ' et votre déclaration 2033-B' : ''}.</p>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 6px; font-weight: 700; font-size: 14px; color: #111;">Étape 4 — Attendez la réponse</p>
      <p style="margin: 0; font-size: 13px; color: #555;">L'administration dispose de 6 mois pour répondre. En cas d'acceptation, remboursement par virement avec intérêts moratoires.</p>
    </div>

    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 12px; color: #92400e;"><strong>Rappel :</strong> Le montant affiché est une estimation. L'administration fiscale reste seule compétente pour statuer. RembourseCFE est un outil d'aide à la rédaction, pas un conseil fiscal.</p>
    </div>

    <p style="margin: 0 0 8px; font-size: 12px; color: #374151;">
      Une question ? Contactez-nous : <a href="mailto:rembourse-cfe@gmail.com" style="color: #1d4ed8;">rembourse-cfe@gmail.com</a>
    </p>
    <p style="font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; margin: 0;">
      © ${new Date().getFullYear()} RembourseCFE — Service d'aide à la réclamation CFE pour LMNP
    </p>
  </div>

</body>
</html>`,
  }
}
