'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Simulation {
  id: string
  created_at: string
  nom: string
  email: string
  siret: string
  annee_cfe: number
  regime: string
  cfe_ligne25: number
  degrevement_reel: number
  stripe_payment_status: string
  documents_sent: boolean
  adresse_bien: string
  ville: string
}

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_DASHBOARD_TOKEN || 'rembourse2026'

export default function Dashboard() {
  const [token, setToken] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState<string | null>(null)
  const [sendingToAdmin, setSendingToAdmin] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all')

  async function loadSimulations() {
    setLoading(true)
    const { data } = await supabase
      .from('simulations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setSimulations(data || [])
    setLoading(false)
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (token === ADMIN_TOKEN) {
      setAuthenticated(true)
      loadSimulations()
    }
  }

  async function handleResend(sim: Simulation) {
    setResending(sim.id)
    try {
      const res = await fetch('/api/resend-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: sim.id, token: ADMIN_TOKEN }),
      })
      if (res.ok) alert(`Documents renvoyés à ${sim.email}`)
      else alert('Erreur lors du renvoi')
    } catch {
      alert('Erreur réseau')
    }
    setResending(null)
  }

  async function handleSendToAdmin(sim: Simulation) {
    setSendingToAdmin(sim.id)
    try {
      const res = await fetch('/api/resend-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: sim.id, token: ADMIN_TOKEN, overrideEmail: 'maxime.lescouzeres@gmail.com' }),
      })
      if (res.ok) alert(`Documents envoyés sur maxime.lescouzeres@gmail.com`)
      else alert('Erreur lors de l\'envoi')
    } catch {
      alert('Erreur réseau')
    }
    setSendingToAdmin(null)
  }

  const filtered = simulations.filter(s => {
    if (filter === 'paid') return s.stripe_payment_status === 'paid'
    if (filter === 'pending') return s.stripe_payment_status !== 'paid'
    return true
  })

  const totalPaid = simulations.filter(s => s.stripe_payment_status === 'paid').length
  const totalCommission = simulations
    .filter(s => s.stripe_payment_status === 'paid')
    .reduce((acc, s) => acc + Math.round(s.degrevement_reel * 0.2), 0)

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-80 space-y-4">
          <h1 className="text-lg font-bold text-gray-900">Dashboard RembourseCFE</h1>
          <input
            type="password"
            placeholder="Token d'accès"
            value={token}
            onChange={e => setToken(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Accéder
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard RembourseCFE</h1>
            <p className="text-sm text-gray-500 mt-1">Gestion des dossiers de dégrèvement CFE</p>
          </div>
          <button onClick={loadSimulations} className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-2">
            ↻ Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Dossiers payés', value: totalPaid, color: 'text-green-600' },
            { label: 'Total dossiers', value: simulations.length, color: 'text-blue-600' },
            { label: 'Commission générée', value: `${totalCommission.toLocaleString('fr-FR')} €`, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-4">
          {(['all', 'paid', 'pending'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'paid' ? 'Payés' : 'En attente'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Aucun dossier</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['ID', 'Date', 'Nom', 'Email', 'CFE', 'Dégrèvement', 'Commission', 'Régime', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(sim => (
                    <tr key={sim.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-400" title={sim.id}>
                        {sim.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{sim.nom}</td>
                      <td className="px-4 py-3 text-gray-500">{sim.email}</td>
                      <td className="px-4 py-3 text-gray-900">{sim.cfe_ligne25?.toLocaleString('fr-FR')} €</td>
                      <td className="px-4 py-3 font-medium text-green-600">{sim.degrevement_reel?.toLocaleString('fr-FR')} €</td>
                      <td className="px-4 py-3 font-medium text-purple-600">
                        {Math.round((sim.degrevement_reel || 0) * 0.2).toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-4 py-3 text-gray-500">{sim.regime === 'reel' ? 'Réel' : 'Micro'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          sim.stripe_payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {sim.stripe_payment_status === 'paid' ? '✓ Payé' : '⏳ En attente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sim.stripe_payment_status === 'paid' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleResend(sim)}
                              disabled={resending === sim.id}
                              className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 rounded px-2 py-1 disabled:opacity-50"
                            >
                              {resending === sim.id ? '...' : '↗ Renvoyer'}
                            </button>
                            <button
                              onClick={() => handleSendToAdmin(sim)}
                              disabled={sendingToAdmin === sim.id}
                              className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-1 disabled:opacity-50"
                            >
                              {sendingToAdmin === sim.id ? '...' : '📩 M\'envoyer'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
