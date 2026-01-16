import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Globe, ChevronRight, Bell, Shield, HelpCircle, LogOut, User, Trash2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { code: 'fr', label: 'Francais', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Espanol', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export default function Settings() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'fr')
  const [showLanguages, setShowLanguages] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Notifications settings
  const [notifCrossings, setNotifCrossings] = useState(
    localStorage.getItem('notif_crossings') !== 'false'
  )
  const [notifLikes, setNotifLikes] = useState(
    localStorage.getItem('notif_likes') !== 'false'
  )

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(
    localStorage.getItem('profile_visible') !== 'false'
  )

  const handleLanguageChange = (code) => {
    setLanguage(code)
    localStorage.setItem('language', code)
    setShowLanguages(false)
    toast.success('Langue changee')
  }

  const handleNotifChange = (type, value) => {
    if (type === 'crossings') {
      setNotifCrossings(value)
      localStorage.setItem('notif_crossings', value)
    } else {
      setNotifLikes(value)
      localStorage.setItem('notif_likes', value)
    }
  }

  const handlePrivacyChange = (value) => {
    setProfileVisible(value)
    localStorage.setItem('profile_visible', value)
  }

  const handleLogout = () => {
    logout()
    navigate('/welcome')
    toast.success('Deconnexion reussie')
  }

  const currentLang = LANGUAGES.find(l => l.code === language)

  return (
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black">LOOKUP</span>
          </div>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide px-4 pt-4 mb-3">
        Parametres
      </h2>

      {/* Account section */}
      <div className="px-4 space-y-2 mb-4">
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <User size={18} className="text-lookup-mint" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Mon profil</p>
              <p className="text-sm text-lookup-gray">{user?.username || 'Utilisateur'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-lookup-gray" />
        </button>
      </div>

      {/* Settings list */}
      <div className="px-4 space-y-2">
        {/* Language */}
        <button
          onClick={() => setShowLanguages(!showLanguages)}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Globe size={18} className="text-lookup-mint" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Langue</p>
              <p className="text-sm text-lookup-gray">{currentLang?.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentLang?.flag}</span>
            <ChevronRight size={18} className={`text-lookup-gray transition ${showLanguages ? 'rotate-90' : ''}`} />
          </div>
        </button>

        {/* Language options */}
        {showLanguages && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full p-4 flex items-center justify-between border-b border-lookup-gray-light last:border-0 ${
                  language === lang.code ? 'bg-lookup-mint-light' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className={`text-sm ${language === lang.code ? 'font-semibold text-lookup-mint-dark' : 'text-lookup-black'}`}>
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
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Bell size={18} className="text-lookup-mint" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Notifications</p>
              <p className="text-sm text-lookup-gray">Gerer les alertes</p>
            </div>
          </div>
          <ChevronRight size={18} className={`text-lookup-gray transition ${showNotifications ? 'rotate-90' : ''}`} />
        </button>

        {/* Notifications options */}
        {showNotifications && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lookup-black text-sm">Nouveaux croisements</p>
                <p className="text-xs text-lookup-gray">Quand quelqu'un croise votre chemin</p>
              </div>
              <button
                onClick={() => handleNotifChange('crossings', !notifCrossings)}
                className={`w-12 h-7 rounded-full transition-colors ${notifCrossings ? 'bg-lookup-mint' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifCrossings ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lookup-black text-sm">Likes</p>
                <p className="text-xs text-lookup-gray">Quand quelqu'un aime votre look</p>
              </div>
              <button
                onClick={() => handleNotifChange('likes', !notifLikes)}
                className={`w-12 h-7 rounded-full transition-colors ${notifLikes ? 'bg-lookup-mint' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${notifLikes ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        )}

        {/* Privacy */}
        <button
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Shield size={18} className="text-lookup-mint" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Confidentialite</p>
              <p className="text-sm text-lookup-gray">Vie privee et donnees</p>
            </div>
          </div>
          <ChevronRight size={18} className={`text-lookup-gray transition ${showPrivacy ? 'rotate-90' : ''}`} />
        </button>

        {/* Privacy options */}
        {showPrivacy && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lookup-black text-sm">Profil visible</p>
                <p className="text-xs text-lookup-gray">Les autres peuvent voir votre look</p>
              </div>
              <button
                onClick={() => handlePrivacyChange(!profileVisible)}
                className={`w-12 h-7 rounded-full transition-colors ${profileVisible ? 'bg-lookup-mint' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${profileVisible ? 'translate-x-6' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        )}

        {/* Help */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <HelpCircle size={18} className="text-lookup-mint" />
            </div>
            <div className="text-left">
              <p className="font-medium text-lookup-black">Aide</p>
              <p className="text-sm text-lookup-gray">FAQ et support</p>
            </div>
          </div>
          <ChevronRight size={18} className={`text-lookup-gray transition ${showHelp ? 'rotate-90' : ''}`} />
        </button>

        {/* Help content */}
        {showHelp && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm p-4 space-y-3">
            <div>
              <p className="font-medium text-lookup-black text-sm">Comment ca marche ?</p>
              <p className="text-xs text-lookup-gray mt-1">
                Publiez votre look du jour, puis deplacez-vous ! Quand vous croisez quelqu'un qui utilise aussi LOOKUP, vous pourrez voir son look pendant 24h.
              </p>
            </div>
            <div>
              <p className="font-medium text-lookup-black text-sm">Je ne vois pas de croisements</p>
              <p className="text-xs text-lookup-gray mt-1">
                Assurez-vous que la localisation est activee et que vous avez publie un look aujourd'hui. Les croisements sont detectes dans un rayon de 100m.
              </p>
            </div>
            <div>
              <p className="font-medium text-lookup-black text-sm">Contact</p>
              <p className="text-xs text-lookup-gray mt-1">
                support@lookup-app.com
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Logout section */}
      <div className="px-4 mt-6">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <p className="font-medium text-red-500">Se deconnecter</p>
          </div>
        </button>
      </div>

      {/* App info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-lookup-gray text-sm">LOOKUP v1.0.0</p>
        <p className="text-lookup-gray text-xs mt-1">Fait avec amour a Paris</p>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-lookup-black text-center">Se deconnecter ?</h3>
            <p className="text-lookup-gray text-sm text-center mt-2">
              Vous devrez vous reconnecter pour acceder a votre compte.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-full border border-gray-200 font-medium text-lookup-black"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-full bg-red-500 font-medium text-white"
              >
                Deconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
