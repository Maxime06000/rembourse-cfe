import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RembourseCFE — Récupérez votre trop-perçu de CFE',
  description: 'Simulez et demandez le dégrèvement de votre CFE en tant que loueur meublé LMNP. Service 100% en ligne, paiement au résultat.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-lg font-semibold text-blue-700">RembourseCFE</a>
            <span className="text-xs text-gray-400 hidden sm:block">Aide à la réclamation CFE pour LMNP</span>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">{children}</main>
        <footer className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-4xl mx-auto px-4 py-8 text-xs text-gray-400 space-y-2">
            <p>RembourseCFE est un outil d'aide à la rédaction. Il ne constitue pas un conseil fiscal ou juridique.</p>
            <p>Les simulations sont des estimations. L'administration fiscale reste seule compétente pour statuer.</p>
            <div className="flex gap-4 pt-2">
              <a href="/cgv" className="hover:text-gray-600 underline">CGV</a>
              <a href="/mentions-legales" className="hover:text-gray-600 underline">Mentions légales</a>
              <a href="mailto:rembourse.cfe@gmail.com" className="hover:text-gray-600 underline">Contact</a>
            </div>
            <p className="pt-1">© {new Date().getFullYear()} RembourseCFE</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
