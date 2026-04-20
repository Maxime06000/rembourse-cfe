import Link from 'next/link'

export default function ConfirmationPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">Paiement confirmé !</h1>
      <p className="text-gray-500 mb-8">
        Votre dossier de réclamation a été généré et envoyé à votre adresse email.
        Vérifiez votre boîte de réception (et vos spams).
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left mb-8 space-y-4">
        <h2 className="font-semibold text-blue-900 text-sm">Que faire maintenant ?</h2>

        {[
          {
            n: '1',
            title: 'Ouvrez votre email',
            desc: 'Vous avez reçu le mail prêt à envoyer à votre SIE ainsi que le formulaire officiel pré-rempli (à signer).',
          },
          {
            n: '2',
            title: 'Connectez-vous sur impots.gouv.fr',
            desc: 'Espace professionnel → Messagerie sécurisée → CFE/CVAE → Je formule une réclamation.',
          },
          {
            n: '3',
            title: 'Copiez-collez le mail et joignez les pièces',
            desc: 'Joignez votre avis CFE et le formulaire officiel pré-rempli reçu par mail — à signer avant envoi.',
          },
          {
            n: '4',
            title: 'Attendez la réponse',
            desc: "L'administration dispose de 6 mois. En cas d'accord, virement avec intérêts moratoires.",
          },
        ].map(step => (
          <div key={step.n} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">{step.title}</p>
              <p className="text-xs text-blue-700 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-700 mb-8 text-left">
        <strong>Rappel :</strong> Le montant de dégrèvement affiché est une estimation. L'administration fiscale reste seule compétente pour statuer sur votre réclamation.
      </div>

      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Retour à l'accueil
      </Link>
    </div>
  )
}
