import { MapPin } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-lookup-mint/5 to-lookup-mint/10">
      {/* Logo animé */}
      <div className="animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-3xl flex items-center justify-center shadow-lg mb-6 mx-auto animate-pulse-slow">
          <MapPin size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-lookup-black tracking-tight text-center">
          LOOKUP
        </h1>
        <p className="text-lookup-gray text-sm mt-2 text-center">
          Croise. Decouvre. Inspire.
        </p>
      </div>

      {/* Loading bar */}
      <div className="mt-12 w-32 h-1 bg-lookup-cream rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-lookup-mint to-lookup-mint-dark rounded-full animate-loading-bar"></div>
      </div>
    </div>
  )
}
