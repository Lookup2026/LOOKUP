import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo */}
      <div className="pt-12 pb-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-lookup-black">LOOKUP</span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="px-8 mb-6">
        <h1 className="text-3xl font-bold text-lookup-black leading-tight">
          Croisez d'autres{'\n'}
          <span className="text-lookup-mint-dark">passionnes de mode</span>
        </h1>
      </div>

      {/* Hero Image */}
      <div className="flex-1 px-6 relative">
        <div className="relative h-full min-h-[300px] bg-gradient-to-b from-lookup-mint-light to-white rounded-3xl overflow-hidden flex items-end justify-center">
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-lookup-mint/20 rounded-full"></div>
          <div className="absolute top-20 right-8 w-12 h-12 bg-pink-200/30 rounded-full"></div>
          <div className="absolute bottom-40 left-6 w-8 h-8 bg-lookup-mint/30 rounded-full"></div>

          {/* Pin markers */}
          <div className="absolute top-16 left-1/4">
            <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center shadow-lg">
              <MapPin size={12} className="text-white" />
            </div>
          </div>
          <div className="absolute top-32 right-1/4">
            <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center shadow-lg">
              <MapPin size={12} className="text-white" />
            </div>
          </div>

          {/* Placeholder for fashion illustration */}
          <div className="text-center pb-8">
            <div className="w-48 h-64 bg-gradient-to-b from-lookup-mint/20 to-transparent rounded-t-full mx-auto flex items-center justify-center">
              <span className="text-lookup-gray text-sm">Mode & Style</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 py-8 space-y-3">
        <Link
          to="/register"
          className="block w-full bg-lookup-mint text-white font-semibold py-4 rounded-full text-center shadow-button hover:bg-lookup-mint-dark transition-all"
        >
          S'inscrire
        </Link>
        <Link
          to="/login"
          className="block w-full bg-white text-lookup-black font-semibold py-4 rounded-full text-center border-2 border-lookup-gray-light hover:border-lookup-mint transition-all"
        >
          Se connecter
        </Link>
        <p className="text-xs text-lookup-gray text-center pt-2">
          En continuant, vous acceptez nos{' '}
          <span className="underline">conditions generales</span>.
        </p>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-4">
        <div className="w-32 h-1 bg-lookup-black rounded-full"></div>
      </div>
    </div>
  )
}
