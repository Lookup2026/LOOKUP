import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { GiPoloShirt, GiRunningShoe, GiSunglasses, GiBilledCap } from 'react-icons/gi'

const floatStyle = (duration, delay) => ({
  animation: `float ${duration}s ease-in-out ${delay}s infinite`,
})

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
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
          LOOKUP permet de retrouver les vêtements portés par les personnes que vous croisez.
        </p>

        {/* Decorative illustration */}
        <div className="mt-10 flex justify-center px-4">
          <div className="relative w-full max-w-xs h-60 rounded-3xl overflow-hidden" style={{background: 'linear-gradient(135deg, rgba(200,230,220,0.4) 0%, rgba(200,230,220,0.15) 50%, rgba(255,255,255,0.3) 100%)'}}>
            {/* Subtle grid dots background */}
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #999 0.8px, transparent 0.8px)', backgroundSize: '20px 20px'}} />

            {/* Clothing items - scattered with float animation */}
            <div className="absolute top-5 left-5 backdrop-blur-sm bg-white/60 rounded-2xl flex items-center justify-center shadow-sm border border-white/40" style={{width: 56, height: 56, ...floatStyle(3, 0)}}>
              <GiPoloShirt size={28} className="text-gray-500" />
            </div>
            <div className="absolute top-3 right-8 backdrop-blur-sm bg-white/60 rounded-2xl flex items-center justify-center shadow-sm border border-white/40" style={{width: 50, height: 50, ...floatStyle(3.5, 0.8)}}>
              <GiRunningShoe size={26} className="text-gray-500" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm bg-white/70 rounded-2xl flex items-center justify-center shadow-md border border-white/50" style={{width: 54, height: 54, ...floatStyle(4, 0.4)}}>
              <GiSunglasses size={28} className="text-gray-600" />
            </div>
            <div className="absolute bottom-5 left-8 backdrop-blur-sm bg-white/60 rounded-2xl flex items-center justify-center shadow-sm border border-white/40" style={{width: 48, height: 48, ...floatStyle(3.2, 1.2)}}>
              <GiBilledCap size={24} className="text-gray-500" />
            </div>

            {/* Pin markers with pulse effect */}
            <div className="absolute top-8 left-1/2 -translate-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-lookup-mint/30 rounded-full animate-ping" style={{animationDuration: '3s'}} />
                <div className="relative w-6 h-6 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                  <MapPin size={11} className="text-white" />
                </div>
              </div>
            </div>
            <div className="absolute top-1/3 right-4">
              <div className="relative">
                <div className="absolute inset-0 bg-lookup-mint/30 rounded-full animate-ping" style={{animationDuration: '4s', animationDelay: '1s'}} />
                <div className="relative w-5 h-5 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                  <MapPin size={10} className="text-white" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-12 left-1/2 translate-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-lookup-mint/30 rounded-full animate-ping" style={{animationDuration: '3.5s', animationDelay: '2s'}} />
                <div className="relative w-5 h-5 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
                  <MapPin size={10} className="text-white" />
                </div>
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
    </div>
  )
}
