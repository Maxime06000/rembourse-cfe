import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Propriétaires LMNP
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Récupérez votre trop-perçu<br />de CFE
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          La CFE est plafonnée à 1,438% de votre valeur ajoutée.
          Simulez votre dégrèvement en 3 minutes.
        </p>
        <Link
          href="/simulateur"
          className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-base"
        >
          Simuler mon dégrèvement →
        </Link>
        <p className="text-xs text-gray-400 mt-3">Gratuit · Paiement uniquement si dégrèvement trouvé</p>
        <p className="text-xs text-gray-400 mt-1">Basé sur les règles fiscales en vigueur — plafonnement de la CFE en fonction de la valeur ajoutée (CGI art. 1647 B sexies)</p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { n: '1', title: 'Je simule', desc: 'Je saisis mes données LMNP. Le simulateur calcule instantanément mon dégrèvement potentiel.' },
          { n: '2', title: 'Je paie', desc: "Si dégrèvement trouvé, je règle la commission sur le montant estimé pour obtenir mon dossier complet." },
          { n: '3', title: 'J\'envoie', desc: "Je reçois le mail pré-rédigé et le formulaire à envoyer à mon Service des Impôts." },
        ].map(s => (
          <div key={s.n} className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center mb-3">
              {s.n}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Legal disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Important :</strong> RembourseCFE est un outil d'aide à la rédaction. Vous envoyez vous-même votre réclamation à l'administration. Le montant affiché est une estimation — l'administration fiscale reste seule compétente pour statuer.
      </div>
    </div>
  )
}
