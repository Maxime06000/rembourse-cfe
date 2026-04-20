'use client'

const STEPS = [
  { id: 'qualification', label: 'Éligibilité' },
  { id: 'avis', label: 'Avis CFE' },
  { id: 'financier', label: 'Données' },
  { id: 'identite', label: 'Coordonnées' },
  { id: 'resultat', label: 'Résultat' },
]

export function StepIndicator({ currentStep }: { currentStep: string }) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStep)

  return (
    <div className="flex items-center gap-1 mb-8">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              active ? 'bg-blue-600 text-white' :
              done ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              {done && <span>✓</span>}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{idx + 1}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px w-3 ${done ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
