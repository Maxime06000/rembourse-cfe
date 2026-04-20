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
  impots_taxes: number
  amortissements: number
  charges_financieres: number
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
  - Impôts et taxes : ${fmt(sim.impots_taxes)}
  - Dotations aux amortissements : ${fmt(sim.amortissements)}
  - Charges financières (intérêts) : ${fmt(sim.charges_financieres)}
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

Références de l'avis d'imposition CFE ${sim.annee_cfe} :
  - Référence de l'avis : ${sim.reference_avis}
  - Numéro de rôle : ${sim.numero_role}
  - SIRET : ${sim.siret}
  - CFE mise en recouvrement (ligne 25) : ${fmt(sim.cfe_ligne25)}
  - Cotisation minimum (ligne 189) : ${fmt(sim.cfe_ligne189)}

${lignesFinancier}

Calcul du plafonnement (art. 1647 B sexies du CGI) :
  Valeur ajoutée retenue × taux de plafonnement = ${fmt(sim.plafonnement)}

La CFE mise en recouvrement (${fmt(sim.cfe_ligne25)}) excédant le montant du plafonnement (${fmt(sim.plafonnement)}), je sollicite un dégrèvement d'un montant de ${fmt(sim.degrevement_reel)}.

Je joins à cette réclamation la copie de mon avis d'imposition CFE ${sim.annee_cfe}${sim.regime === 'reel' ? ' ainsi que ma déclaration 2033-B' : ''}.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes respectueuses salutations.

${sim.nom}`
}

export function genererEmailConfirmation(sim: SimulationData): { subject: string; html: string } {
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €'

  return {
    subject: `Votre dossier de dégrèvement CFE ${sim.annee_cfe} — RembourseCFE`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1d4ed8; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 20px;">RembourseCFE</h1>
    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Votre dossier de dégrèvement CFE ${sim.annee_cfe} est prêt</p>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; margin: 0;">
    <p style="margin: 0 0 4px; font-size: 13px; color: #166534;">Dégrèvement estimé</p>
    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #14532d;">${fmt(sim.degrevement_reel)}</p>
  </div>

  <div style="background: white; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
    <h2 style="font-size: 16px; margin: 0 0 16px;">Que faire maintenant ?</h2>

    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Étape 1 — Envoyez le mail ci-joint à votre SIE</p>
      <p style="margin: 0; font-size: 13px; color: #555;">Connectez-vous à votre espace professionnel sur <strong>impots.gouv.fr</strong> → Messagerie sécurisée → Formulaire "Contribution économique territoriale (CFE/CVAE)" → "Je formule une réclamation".</p>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Étape 2 — Joignez les pièces</p>
      <p style="margin: 0; font-size: 13px; color: #555;">Joignez votre avis d'imposition CFE ${sim.annee_cfe}${sim.regime === 'reel' ? ' et votre déclaration 2033-B' : ''}.</p>
    </div>

    <div style="background: #f9fafb; border-left: 4px solid #9ca3af; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Étape 3 — Attendez la réponse</p>
      <p style="margin: 0; font-size: 13px; color: #555;">L'administration dispose de 6 mois pour répondre. En cas d'acceptation, le remboursement est effectué par virement avec intérêts moratoires.</p>
    </div>

    <p style="font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; margin: 0;">
      RembourseCFE est un outil d'aide à la rédaction. Ce document ne constitue pas un conseil fiscal ou juridique.
      Le montant affiché est une estimation — l'administration fiscale reste seule compétente.
      <br>© ${new Date().getFullYear()} RembourseCFE
    </p>
  </div>
</body>
</html>`,
  }
}
