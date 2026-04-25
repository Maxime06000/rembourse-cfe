export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mentions Légales</h1>

      <div className="space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Éditeur</h2>
          <div className="text-gray-600 space-y-1">
            <p><strong>RembourseCFE</strong></p>
            <p>Maxime Lescouzères, auto-entrepreneur</p>
            <p>Email : <a href="mailto:maxime.lescouzeres@gmail.com" className="text-blue-600">maxime.lescouzeres@gmail.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Hébergement</h2>
          <div className="text-gray-600 space-y-1">
            <p><strong>Vercel Inc.</strong></p>
            <p>440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
            <p><a href="https://vercel.com" className="text-blue-600">vercel.com</a></p>
            <p className="mt-2"><strong>Supabase Inc.</strong> (base de données)</p>
            <p>Hébergement en Union Européenne (Frankfurt)</p>
            <p><a href="https://supabase.com" className="text-blue-600">supabase.com</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Données personnelles (RGPD)</h2>
          <div className="text-gray-600 space-y-2">
            <p><strong>Responsable du traitement :</strong> Maxime Lescouzères</p>
            <p><strong>Données collectées :</strong> nom et prénom, adresse email, numéro SIRET,
              adresse du bien, montant CFE, données fiscales (recettes, charges selon le régime).</p>
            <p><strong>Finalité :</strong> génération du dossier fiscal, facturation, envoi des documents par email.</p>
            <p><strong>Durée de conservation :</strong> 6 ans à compter de la date de paiement
              (durée légale de prescription fiscale).</p>
            <p><strong>Sous-traitants :</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Supabase (stockage des données) — serveurs UE</li>
              <li>Stripe (paiement) — aucune donnée bancaire stockée par RembourseCFE</li>
              <li>Resend (envoi d&apos;emails)</li>
            </ul>
            <p className="mt-2">
              <strong>Vos droits :</strong> conformément au RGPD et à la loi Informatique et Libertés,
              vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données,
              ainsi que d&apos;un droit d&apos;opposition au traitement. Pour exercer ces droits :
              <a href="mailto:maxime.lescouzeres@gmail.com" className="text-blue-600 ml-1">maxime.lescouzeres@gmail.com</a>
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL :
              <a href="https://www.cnil.fr" className="text-blue-600 ml-1">www.cnil.fr</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Cookies</h2>
          <p className="text-gray-600">
            RembourseCFE n&apos;utilise pas de cookies publicitaires ou de tracking.
            Des cookies techniques strictement nécessaires au fonctionnement du service peuvent être déposés.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
          <p className="text-gray-600">
            L&apos;ensemble du site (code, textes, logique de calcul) est la propriété exclusive de RembourseCFE.
            Les formulaires fiscaux (1327-CET-SD, 1327-S-CET-SD) sont des documents officiels de la DGFiP
            reproduits conformément à leur usage légal.
          </p>
        </section>

      </div>
    </div>
  )
}
