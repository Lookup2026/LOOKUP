import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Globe, ChevronRight, Bell, Shield, HelpCircle } from 'lucide-react'

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Espanol', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export default function Settings() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr')
  const [showLanguages, setShowLanguages] = useState(false)

  const handleLanguageChange = (code) => {
    setLanguage(code)
    localStorage.setItem('language', code)
    setShowLanguages(false)
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-lookup-black" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </div>
          <span className="text-lg font-bold text-lookup-black">LOOKUP</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-lookup-black px-4 mt-4 mb-6">
        Parametres
      </h1>

      {/* Settings list */}
      <div className="px-4 space-y-3">
        {/* Language */}
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="w-full bg-lookup-cream rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Globe size={20} className="text-lookup-mint-dark" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Langue</p>
              <p className="text-sm text-lookup-gray">{currentLang?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentLang?.flag}</span>
            <ChevronRight size={20} className={`text-lookup-gray transition ${showLanguages ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {/* Language options */}
        {showLanguages && (
          <div className="bg-lookup-cream rounded-2xl overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-4 flex items-center justify-between border-b border-lookup-gray-light last:border-0 ${
                  language === lang.code ? 'bg-lookup-mint-light' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`${language === lang.code ? 'font-semibold text-lookup-mint-dark' : 'text-lookup-black'}`}>
                    {lang.label}
                  </span>
                </div>
                {language === lang.code && (
                  <div className="w-5 h-5 bg-lookup-mint rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Notifications */}
        <button className="w-full bg-lookup-cream rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Bell size={20} className="text-lookup-mint-dark" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Notifications</p>
              <p className="text-sm text-lookup-gray">Gerer les alertes</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-lookup-gray" />
        </button>

        {/* Privacy */}
        <button className="w-full bg-lookup-cream rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Shield size={20} className="text-lookup-mint-dark" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Confidentialite</p>
              <p className="text-sm text-lookup-gray">Vie privee et donnees</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-lookup-gray" />
        </button>

        {/* Help */}
        <button className="w-full bg-lookup-cream rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <HelpCircle size={20} className="text-lookup-mint-dark" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Aide</p>
              <p className="text-sm text-lookup-gray">FAQ et support</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-lookup-gray" />
        </button>
      </div>

      {/* App info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-lookup-gray text-sm">LOOKUP v1.0.0</p>
        <p className="text-lookup-gray text-xs mt-1">Made with ❤️ in Paris</p>
      </div>
    </div>
  )
}
