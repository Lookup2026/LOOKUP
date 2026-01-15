import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo */}
      <div className="pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
            <MapPin size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-lookup-black">LOOKUP</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center px-8">
        {/* Main Title */}
        <h1 className="text-3xl font-bold text-lookup-black leading-tight text-center mb-4">
          Vous avez aimé une tenue ?{'\n'}
          <span className="text-lookup-mint-dark">Retrouvez-la.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lookup-gray text-center text-base leading-relaxed max-w-xs mx-auto">
          LOOKUP permet de retrouver les vêtements portés par les personnes que vous croisez dans la rue.
        </p>

        {/* Decorative illustration */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-64 h-48 bg-gradient-to-b from-lookup-mint-light to-white rounded-3xl overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-6 left-6 w-12 h-12 bg-lookup-mint/20 rounded-full"></div>
            <div className="absolute top-10 right-8 w-8 h-8 bg-lookup-mint/30 rounded-full"></div>
            <div className="absolute bottom-12 left-10 w-6 h-6 bg-lookup-mint/25 rounded-full"></div>

            {/* Pin markers */}
            <div className="absolute top-8 left-1/3">
              <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                <MapPin size={12} className="text-white" />
              </div>
            </div>
            <div className="absolute top-16 right-1/4">
              <div className="w-5 h-5 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                <MapPin size={10} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-16 left-1/2">
              <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                <MapPin size={12} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 py-8 space-y-3">
        <Link
          to="/register"
          className="block w-full bg-lookup-mint text-white font-semibold py-4 rounded-full text-center shadow-lg hover:bg-lookup-mint-dark transition-all"
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
          <span className="underline">conditions générales</span>.
        </p>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-4">
        <div className="w-32 h-1 bg-lookup-black rounded-full"></div>
      </div>
    </div>
  )
}
