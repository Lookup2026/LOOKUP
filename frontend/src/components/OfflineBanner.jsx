import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      // Garder le bandeau visible 2s pour montrer "Connexion retablie"
      setTimeout(() => setShowBanner(false), 2000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Etat initial
    if (!navigator.onLine) {
      setShowBanner(true)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
        isOffline
          ? 'bg-red-500 text-white'
          : 'bg-green-500 text-white'
      }`}
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 12px))' }}
    >
      {isOffline ? (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">Pas de connexion internet</span>
        </>
      ) : (
        <span className="text-sm font-medium">Connexion retablie</span>
      )}
    </div>
  )
}
