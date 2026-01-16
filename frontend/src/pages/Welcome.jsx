import { Link } from 'react-router-dom'
import { MapPin, Sparkles } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-lookup-cream to-lookup-mint-light flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="pt-10 pb-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-md">
            <MapPin size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-lookup-black tracking-tight">LOOKUP</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col px-6">
        {/* Main Title */}
        <h1 className="text-[28px] font-bold text-lookup-black leading-tight text-center mt-4">
          Vous avez aimé un{' '}
          <span className="text-lookup-mint-dark">style</span> ?
          <br />
          <span className="text-lookup-mint-dark">Retrouvez-le.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lookup-gray text-center text-sm leading-relaxed max-w-[280px] mx-auto mt-3">
          Decouvrez les tenues des personnes que vous croisez et partagez votre style.
        </p>

        {/* Fashion Illustration */}
        <div className="flex-1 flex items-center justify-center mt-6 mb-4">
          <div className="relative w-full max-w-[320px] aspect-square">
            {/* Background gradient circle */}
            <div className="absolute inset-4 bg-gradient-to-br from-lookup-mint-light via-white to-lookup-mint-light/50 rounded-full opacity-60"></div>

            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-lookup-mint/20 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-lookup-mint/10 rounded-full"></div>
            </div>

            {/* Person 1 - Left */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                {/* Outfit card */}
                <div className="w-24 h-32 bg-white rounded-2xl shadow-xl overflow-hidden border border-lookup-mint/20">
                  <div className="h-full bg-gradient-to-b from-lookup-mint-light to-white flex flex-col items-center justify-center p-2">
                    {/* Silhouette */}
                    <div className="w-8 h-8 bg-lookup-mint/30 rounded-full mb-1"></div>
                    <div className="w-10 h-3 bg-lookup-mint/40 rounded-full mb-1"></div>
                    <div className="w-6 h-8 bg-lookup-mint/30 rounded-lg mb-1"></div>
                    <div className="w-8 h-6 bg-lookup-mint/20 rounded-md"></div>
                  </div>
                </div>
                {/* Location ping */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-lg">
                  <MapPin size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* Person 2 - Right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                {/* Outfit card */}
                <div className="w-24 h-32 bg-white rounded-2xl shadow-xl overflow-hidden border border-lookup-mint/20">
                  <div className="h-full bg-gradient-to-b from-white to-lookup-mint-light flex flex-col items-center justify-center p-2">
                    {/* Silhouette */}
                    <div className="w-8 h-8 bg-lookup-mint-dark/30 rounded-full mb-1"></div>
                    <div className="w-12 h-3 bg-lookup-mint-dark/40 rounded-full mb-1"></div>
                    <div className="w-8 h-10 bg-lookup-mint-dark/30 rounded-lg"></div>
                  </div>
                </div>
                {/* Location ping */}
                <div className="absolute -bottom-2 -left-2 w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-lg">
                  <MapPin size={14} className="text-white" />
                </div>
              </div>
            </div>

            {/* Center connection */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-lookup-mint">
                  <Sparkles size={24} className="text-lookup-mint-dark" />
                </div>
                {/* Connection lines */}
                <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-gradient-to-r from-transparent to-lookup-mint/50"></div>
                <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-l from-transparent to-lookup-mint/50"></div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <div className="w-3 h-3 bg-lookup-mint/40 rounded-full animate-bounce"></div>
            </div>
            <div className="absolute bottom-12 left-1/4">
              <div className="w-2 h-2 bg-lookup-mint-dark/30 rounded-full"></div>
            </div>
            <div className="absolute bottom-16 right-1/4">
              <div className="w-2 h-2 bg-lookup-mint/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Features pills */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-lookup-gray shadow-sm">
            Croisez
          </span>
          <span className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-lookup-gray shadow-sm">
            Decouvrez
          </span>
          <span className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full text-xs font-medium text-lookup-gray shadow-sm">
            Partagez
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-6 pt-2 space-y-3 bg-gradient-to-t from-white via-white to-transparent">
        <Link
          to="/register"
          className="block w-full bg-gradient-to-r from-lookup-mint to-lookup-mint-dark text-white font-semibold py-4 rounded-2xl text-center shadow-lg shadow-lookup-mint/30 hover:shadow-xl hover:shadow-lookup-mint/40 transition-all active:scale-[0.98]"
        >
          Commencer
        </Link>
        <Link
          to="/login"
          className="block w-full bg-white text-lookup-black font-semibold py-4 rounded-2xl text-center border border-lookup-gray-light/50 hover:border-lookup-mint transition-all active:scale-[0.98]"
        >
          J'ai deja un compte
        </Link>
        <p className="text-[10px] text-lookup-gray/70 text-center pt-1">
          En continuant, vous acceptez nos{' '}
          <span className="underline">conditions generales</span>
        </p>
      </div>
    </div>
  )
}
