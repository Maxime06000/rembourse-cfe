export default function CGV() {
  const version = 'v1.0 – avril 2026'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
      <p className="text-xs text-gray-400 mb-8">{version}</p>

      <div className="prose prose-sm prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Éditeur du service</h2>
          <p className="text-gray-600">
            RembourseCFE est édité par Maxime Lescouzères, auto-entrepreneur, dont l&apos;adresse électronique de contact est{' '}
            <a href="mailto:rembourse.cfe@gmail.com" className="text-blue-600">rembourse.cfe@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Nature du service</h2>
          <p className="text-gray-600">
            RembourseCFE est un <strong>outil logiciel d&apos;aide à la saisie et à la génération de documents</strong>.
            Il permet à l&apos;utilisateur de produire automatiquement le formulaire fiscal 1327-CET-SD ou 1327-S-CET-SD
            (demande de plafonnement CFE en fonction de la valeur ajoutée) à partir des données qu&apos;il saisit lui-même.
          </p>
          <p className="text-gray-600 mt-2">
            RembourseCFE <strong>n&apos;est pas un cabinet d&apos;expertise comptable, un cabinet d&apos;avocat, ni un conseiller fiscal</strong>.
            Le service ne constitue pas un conseil juridique ou fiscal au sens de l&apos;ordonnance du 10 septembre 1817
            et de la loi n° 71-1130 du 31 décembre 1971. L&apos;utilisateur reste seul responsable de ses déclarations fiscales.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Obligation de moyens — Absence de garantie de résultat</h2>
          <p className="text-gray-600">
            RembourseCFE s&apos;engage à fournir un outil de calcul et de génération de documents conforme
            aux formulaires officiels de la DGFiP et aux taux publiés. Cette obligation est une <strong>obligation de moyens</strong>.
          </p>
          <p className="text-gray-600 mt-2">
            RembourseCFE <strong>ne garantit pas l&apos;obtention du dégrèvement</strong>. L&apos;acceptation de la demande
            dépend exclusivement de l&apos;appréciation de l&apos;administration fiscale (Service des Impôts des Entreprises)
            et de l&apos;exactitude des données saisies par l&apos;utilisateur.
          </p>
          <p className="text-gray-600 mt-2">
            En particulier, toute erreur dans les montants saisis (recettes, charges, montant CFE, SIRET)
            est de la seule responsabilité de l&apos;utilisateur et peut rendre la réclamation caduque.
          </p>
          <p className="text-gray-600 mt-2">
            En tout état de cause, si la responsabilité de l&apos;Éditeur devait être engagée,
            le montant des indemnités ne pourra excéder le montant total payé par l&apos;Utilisateur
            pour le service concerné.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Délais de traitement administratif</h2>
          <p className="text-gray-600">
            L&apos;Éditeur ne dispose d&apos;aucun contrôle sur les délais de traitement des Services des Impôts
            des Entreprises (SIE). Un retard ou une absence de réponse de l&apos;administration ne peut en aucun
            cas justifier un remboursement de la prestation RembourseCFE.
          </p>
          <p className="text-gray-600 mt-2">
            À titre indicatif, l&apos;administration fiscale dispose d&apos;un délai légal pouvant aller jusqu&apos;à
            6 mois pour statuer sur une réclamation contentieuse (art. R.* 198-10 du LPF).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Modification de la réglementation</h2>
          <p className="text-gray-600">
            L&apos;outil est mis à jour selon la réglementation fiscale connue au jour de la génération du document.
            L&apos;Éditeur ne saurait être tenu responsable des conséquences d&apos;une modification législative
            ou réglementaire rétroactive ou survenant après la date de paiement.
          </p>
          <p className="text-gray-600 mt-2">
            En cas de modification substantielle affectant les calculs (notamment le taux de plafonnement
            prévu à l&apos;article 1647 B sexies du CGI), l&apos;Éditeur s&apos;engage à mettre à jour l&apos;outil
            dans les meilleurs délais mais ne peut garantir une rétroactivité sur les dossiers déjà générés.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Exclusion des cas particuliers</h2>
          <p className="text-gray-600">
            Le service est destiné aux cas généraux de location meublée non professionnelle (LMNP)
            et d&apos;entreprises soumises au régime réel ou micro-BIC. Il n&apos;est <strong>pas adapté</strong> aux
            situations spécifiques suivantes :
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>Cessation ou cession d&apos;activité en cours d&apos;année</li>
            <li>Fusion, absorption ou scission d&apos;entreprise</li>
            <li>Procédures collectives (redressement, liquidation judiciaire)</li>
            <li>Pluridétention complexe ou indivision</li>
            <li>Activités mixtes ou changement de régime fiscal en cours d&apos;année</li>
          </ul>
          <p className="text-gray-600 mt-2">
            Il appartient à l&apos;utilisateur de vérifier auprès d&apos;un professionnel qualifié
            (expert-comptable ou avocat fiscaliste) si sa situation particulière permet l&apos;application
            du plafonnement en fonction de la valeur ajoutée.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Prix et facturation</h2>
          <p className="text-gray-600">
            La prestation de RembourseCFE consiste en la <strong>mise à disposition d&apos;un dossier numérique pré-rempli</strong>
            (formulaire fiscal + mail de réclamation). Le prix est une commission calculée à 20 % du dégrèvement estimé,
            bornée entre 39 € et 99 € TTC.
          </p>
          <p className="text-gray-600 mt-2">
            Ce prix est dû pour la fourniture du service logiciel, <strong>indépendamment du versement effectif du dégrèvement
            par l&apos;administration fiscale</strong>. Le paiement du service ne crée aucune obligation de résultat.
          </p>
          <p className="text-gray-600 mt-2">
            <strong>TVA non applicable, article 293 B du CGI</strong> (franchise en base de TVA).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Renonciation au droit de rétractation</h2>
          <p className="text-gray-600">
            Conformément à l&apos;article L.221-28 12° du Code de la consommation, <strong>le droit de rétractation de 14 jours
            ne s&apos;applique pas</strong> aux contenus numériques non fournis sur support matériel dont l&apos;exécution a commencé
            avec l&apos;accord exprès du consommateur et renoncement exprès à son droit de rétractation.
          </p>
          <p className="text-gray-600 mt-2">
            En cochant la case dédiée avant le paiement, l&apos;utilisateur reconnaît expressément avoir été informé
            de cette exception et y renonce. La fourniture du document numérique (PDF + email) est immédiate après paiement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">9. Responsabilité de l&apos;utilisateur</h2>
          <p className="text-gray-600">L&apos;utilisateur est seul responsable :</p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>de l&apos;exactitude des données saisies (CA, charges, montant CFE, SIRET, adresse)</li>
            <li>de l&apos;envoi effectif du formulaire au Service des Impôts des Entreprises compétent</li>
            <li>du respect des délais de réclamation (31/12/N+2 pour la CFE de l&apos;année N)</li>
            <li>de la conservation des documents fiscaux (obligation légale de 6 ans)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">10. Données personnelles</h2>
          <p className="text-gray-600">
            Les données collectées (nom, email, SIRET, données fiscales) sont utilisées exclusivement
            pour la génération du dossier et la facturation. Elles sont stockées sur des serveurs sécurisés
            (Supabase, hébergement UE) et ne sont pas revendues à des tiers.
            Conformément au RGPD, l&apos;utilisateur dispose d&apos;un droit d&apos;accès, de rectification et de suppression
            en contactant <a href="mailto:rembourse.cfe@gmail.com" className="text-blue-600">rembourse.cfe@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">11. Litiges</h2>
          <p className="text-gray-600">
            En cas de litige, une solution amiable sera recherchée en priorité. À défaut,
            les tribunaux français sont compétents. Le droit applicable est le droit français.
          </p>
          <p className="text-gray-600 mt-2">
            Conformément à l&apos;article L.616-1 du Code de la consommation, l&apos;utilisateur peut recourir
            gratuitement au médiateur de la consommation compétent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">12. Modification des CGV</h2>
          <p className="text-gray-600">
            RembourseCFE se réserve le droit de modifier les présentes CGV. La version applicable est celle
            en vigueur au moment du paiement, dont la version et la date d&apos;acceptation sont archivées
            dans notre base de données.
          </p>
        </section>

      </div>
    </div>
  )
}
