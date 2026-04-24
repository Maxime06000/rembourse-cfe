'use client'

import { useSimulation } from '@/lib/store'
import { StepIndicator } from '@/components/StepIndicator'
import { StepQualification } from './steps/StepQualification'
import { StepAvisCFE } from './steps/StepAvisCFE'
import { StepFinancier } from './steps/StepFinancier'
import { StepIdentite } from './steps/StepIdentite'
import { StepResultat } from './steps/StepResultat'

export default function SimulateurPage() {
  const step = useSimulation(s => s.step)

  const showIndicator = !['resultat', 'paiement', 'confirmation'].includes(step)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Simulateur de dégrèvement CFE</h1>
        <p className="text-sm text-gray-500 mt-1">Remplissez les informations ci-dessous pour estimer votre dégrèvement.</p>
      </div>

      {showIndicator && <StepIndicator currentStep={step} />}

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        {step === 'qualification' && <StepQualification />}
        {step === 'avis' && <StepAvisCFE />}
        {step === 'financier' && <StepFinancier />}
        {step === 'identite' && <StepIdentite />}
        {step === 'resultat' && <StepResultat />}
      </div>
    </div>
  )
}
