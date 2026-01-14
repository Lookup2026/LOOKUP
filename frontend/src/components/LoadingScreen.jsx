import { MapPin } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={22} className="text-white" />
          </div>
          <span className="text-3xl font-bold text-lookup-black">LOOKUP</span>
        </div>
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}
