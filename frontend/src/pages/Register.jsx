import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caracteres')
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
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">LOOKUP</h1>
        <p className="text-gray-400">Creez votre compte</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />
        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />
        <input
          type="text"
          name="fullName"
          placeholder="Nom complet (optionnel)"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmer le mot de passe"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? 'Creation...' : 'Creer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Deja un compte ?{' '}
        <Link to="/login" className="text-lookup-accent hover:underline">
          Connexion
        </Link>
      </p>
    </div>
  )
}
