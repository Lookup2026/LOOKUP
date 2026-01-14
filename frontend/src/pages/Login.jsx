import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Connexion reussie')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">LOOKUP</h1>
        <p className="text-gray-400">Decouvrez les looks autour de vous</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-400">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-lookup-accent hover:underline">
          Inscription
        </Link>
      </p>
    </div>
  )
}
