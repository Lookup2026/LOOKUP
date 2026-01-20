import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Camera, Users, Sparkles, ChevronRight, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const STEPS = [
  {
    icon: Camera,
    title: 'Publie ton look',
    description: 'Chaque jour, partage ta tenue en une photo. C\'est simple et rapide !',
    color: 'bg-lookup-mint',
  },
  {
    icon: Users,
    title: 'Croise du monde',
    description: 'Vis ta journee normalement. LOOKUP detecte automatiquement les personnes que tu croises, meme quand ton telephone est en veille.',
    color: 'bg-purple-400',
  },
  {
    icon: Sparkles,
    title: 'Retrouve ce style',
    description: 'Tu as croise une veste qui t\'a plu ? Ouvre l\'app plus tard et decouvre le look complet de cette personne !',
    color: 'bg-orange-400',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Marquer l'onboarding comme termine
      localStorage.setItem('onboarding_done', 'true')
      // Aller publier le premier look
      navigate('/add-look')
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_done', 'true')
    navigate('/add-look')
  }

  const step = STEPS[currentStep]
  const StepIcon = step.icon

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-lookup-mint rounded-full flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-lookup-black">LOOKUP</span>
        </div>
        <button
          onClick={handleSkip}
          className="text-lookup-gray text-sm font-medium"
        >
          Passer
        </button>
      </div>

      {/* Welcome message */}
      {currentStep === 0 && (
        <div className="px-6 pt-8">
          <h1 className="text-2xl font-bold text-lookup-black">
            Bienvenue {user?.username} !
          </h1>
          <p className="text-lookup-gray mt-1">
            Decouvre comment fonctionne LOOKUP
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Icon */}
        <div className={`w-24 h-24 ${step.color} rounded-full flex items-center justify-center mb-8 shadow-lg`}>
          <StepIcon size={40} className="text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-lookup-black text-center mb-3">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-lookup-gray text-center text-base leading-relaxed max-w-xs">
          {step.description}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-10">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-lookup-mint'
                  : index < currentStep
                  ? 'w-2 bg-lookup-mint'
                  : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleNext}
          className="w-full bg-lookup-mint text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              <Camera size={20} />
              <span>Publier mon premier look</span>
            </>
          ) : (
            <>
              <span>Suivant</span>
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
