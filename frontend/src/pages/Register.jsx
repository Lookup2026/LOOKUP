import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.fullName
      )
      toast.success('Compte cree avec succes')
      navigate('/onboarding')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-12">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-lookup-black">LOOKUP</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-lookup-black mb-8">S'inscrire</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input-field"
        />
        <input
          type="text"
          name="username"
          placeholder="Pseudo"
          value={formData.username}
          onChange={handleChange}
          required
          className="input-field"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="input-field"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lookup-mint text-white font-semibold py-4 rounded-full shadow-button hover:bg-lookup-mint-dark transition-all disabled:opacity-50"
        >
          {loading ? 'Création...' : 'S\'inscrire'}
        </button>

        <div className="text-center">
          <span className="text-lookup-gray text-sm">ou</span>
        </div>

        <Link
          to="/login"
          className="block w-full bg-white text-lookup-black font-semibold py-4 rounded-full text-center border-2 border-lookup-gray-light hover:border-lookup-mint transition-all"
        >
          Se connecter
        </Link>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white text-lookup-black font-medium py-4 rounded-full border-2 border-lookup-gray-light hover:border-lookup-mint transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>
      </form>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-xs text-lookup-gray">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-lookup-mint-dark underline">
            Se connecter
          </Link>
        </p>
        <p className="text-xs text-lookup-gray mt-4">
          En continuant, vous acceptez nos{' '}
          <span className="underline">conditions générales</span>
          {' '}et notre{' '}
          <span className="underline">politique de confidentialité</span>.
        </p>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-4">
        <div className="w-32 h-1 bg-lookup-black rounded-full"></div>
      </div>
    </div>
  )
}
