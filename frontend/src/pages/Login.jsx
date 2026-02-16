import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login, appleLogin } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [appleLoading, setAppleLoading] = useState(false)
  const applePluginRef = useRef(null)

  // Load Apple Sign In plugin dynamically
  useEffect(() => {
    import('@capacitor-community/apple-sign-in')
      .then(mod => { applePluginRef.current = mod.SignInWithApple })
      .catch(() => { /* Plugin not available (web browser) */ })
  }, [])

  // Afficher un message si session expiree
  useEffect(() => {
    if (sessionStorage.getItem('session_expired')) {
      sessionStorage.removeItem('session_expired')
      toast.error('Ta session a expire, reconnecte-toi')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Connexion réussie')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    const SignInWithApple = applePluginRef.current
    if (!SignInWithApple) {
      toast.error('Sign in with Apple n\'est disponible que sur iOS')
      return
    }

    setAppleLoading(true)
    try {
      const result = await SignInWithApple.authorize({
        clientId: 'com.lookup.app',
        redirectURI: 'https://lookup-app.fr',
        scopes: 'email name',
      })

      const { identityToken, email: appleEmail, givenName, familyName } = result.response
      const fullName = [givenName, familyName].filter(Boolean).join(' ') || null

      const { isNewUser } = await appleLogin(identityToken, appleEmail, fullName)

      if (isNewUser) {
        localStorage.setItem('show_onboarding', 'true')
        toast.success('Compte cree avec succes')
        navigate('/onboarding', { replace: true })
      } else {
        toast.success('Connexion reussie')
        navigate('/')
      }
    } catch (error) {
      // Error code 1001 = user cancelled
      if (error?.code !== '1001' && error?.message !== 'The operation couldn\'t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1001.)') {
        toast.error(error.response?.data?.detail || 'Erreur de connexion Apple')
      }
    } finally {
      setAppleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-lookup-black">LOOKUP</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-lookup-black mb-8">Se connecter</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lookup-mint text-white font-semibold py-4 rounded-full shadow-button hover:bg-lookup-mint-dark transition-all disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="text-center">
          <span className="text-lookup-gray text-sm">ou</span>
        </div>

        {/* Sign in with Apple */}
        <button
          type="button"
          onClick={handleAppleSignIn}
          disabled={appleLoading}
          className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-4 rounded-full transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {appleLoading ? 'Connexion...' : 'Continuer avec Apple'}
        </button>

        <Link
          to="/register"
          className="block w-full bg-white text-lookup-black font-semibold py-4 rounded-full text-center border-2 border-lookup-gray-light hover:border-lookup-mint transition-all"
        >
          S'inscrire
        </Link>
      </form>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs text-lookup-gray">
          En continuant, vous acceptez nos{' '}
          <Link to="/cgu" className="underline">conditions générales</Link>
          {' '}et notre{' '}
          <Link to="/privacy" className="underline">politique de confidentialité</Link>.
        </p>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-4">
        <div className="w-32 h-1 bg-lookup-black rounded-full"></div>
      </div>
    </div>
  )
}
