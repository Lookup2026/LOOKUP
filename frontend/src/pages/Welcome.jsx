import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo en haut */}
      <div className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-7 h-7 bg-lookup-mint rounded-full flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-lookup-black tracking-tight">LOOKUP</span>
        </div>
      </div>

      {/* Illustration principale */}
      <div className="flex-1 flex flex-col items-center px-6 pt-2">
        <svg
          viewBox="0 0 300 360"
          className="w-full max-w-[280px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lignes de trajectoire elegantes */}
          <g stroke="#e5e5e5" strokeWidth="1" fill="none">
            <path d="M40 350 Q60 280 90 220 Q120 160 150 180"/>
            <path d="M260 350 Q240 280 210 220 Q180 160 150 180"/>
          </g>

          {/* Personne 1 - Homme en haut a gauche */}
          <g transform="translate(60, 30)">
            {/* Tete */}
            <circle cx="20" cy="10" r="8" stroke="#2a2a2a" strokeWidth="1.5" fill="none"/>
            {/* Corps - veste avec couleur subtile */}
            <path d="M8 20 C8 18 12 16 20 16 C28 16 32 18 32 20 L34 50 L6 50 Z"
                  stroke="#2a2a2a" strokeWidth="1.5" fill="#F5E1E1"/>
            {/* Bras */}
            <path d="M8 22 Q2 35 6 48" stroke="#2a2a2a" strokeWidth="1.5"/>
            <path d="M32 22 Q38 35 34 48" stroke="#2a2a2a" strokeWidth="1.5"/>
            {/* Jambes */}
            <path d="M14 50 L12 75" stroke="#2a2a2a" strokeWidth="1.5"/>
            <path d="M26 50 L28 75" stroke="#2a2a2a" strokeWidth="1.5"/>
          </g>

          {/* Personne 2 - Femme en haut a droite */}
          <g transform="translate(200, 25)">
            {/* Tete */}
            <circle cx="20" cy="10" r="7" stroke="#2a2a2a" strokeWidth="1.5" fill="none"/>
            {/* Cheveux */}
            <path d="M13 8 Q10 20 12 35" stroke="#2a2a2a" strokeWidth="1.2"/>
            <path d="M27 8 Q30 20 28 35" stroke="#2a2a2a" strokeWidth="1.2"/>
            {/* Robe/Manteau */}
            <path d="M10 18 C10 16 15 15 20 15 C25 15 30 16 30 18 L32 65 L8 65 Z"
                  stroke="#2a2a2a" strokeWidth="1.5" fill="none"/>
            {/* Bras */}
            <path d="M10 20 Q4 35 8 50" stroke="#2a2a2a" strokeWidth="1.5"/>
            <path d="M30 20 Q36 35 32 50" stroke="#2a2a2a" strokeWidth="1.5"/>
            {/* Jambes */}
            <path d="M16 65 L15 80" stroke="#2a2a2a" strokeWidth="1.5"/>
            <path d="M24 65 L25 80" stroke="#2a2a2a" strokeWidth="1.5"/>
          </g>

          {/* Personne 3 - Silhouette plus petite au milieu gauche */}
          <g transform="translate(30, 140) scale(0.7)">
            <circle cx="20" cy="10" r="7" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M10 18 L30 18 L32 55 L8 55 Z" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M14 55 L13 72" stroke="#2a2a2a" strokeWidth="1.3"/>
            <path d="M26 55 L27 72" stroke="#2a2a2a" strokeWidth="1.3"/>
          </g>

          {/* Personne 4 - Silhouette plus petite au milieu droite */}
          <g transform="translate(230, 130) scale(0.7)">
            <circle cx="20" cy="10" r="7" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            {/* Haut avec couleur subtile */}
            <path d="M10 18 L30 18 L28 40 L12 40 Z" stroke="#2a2a2a" strokeWidth="1.3" fill="#F5E1E1"/>
            <path d="M12 40 L32 40 L34 60 L10 60 Z" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M16 60 L15 75" stroke="#2a2a2a" strokeWidth="1.3"/>
            <path d="M24 60 L25 75" stroke="#2a2a2a" strokeWidth="1.3"/>
          </g>

          {/* Personne 5 - En bas gauche */}
          <g transform="translate(80, 250) scale(0.65)">
            <circle cx="20" cy="10" r="7" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M10 18 L30 18 L32 55 L8 55 Z" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M14 55 L12 72" stroke="#2a2a2a" strokeWidth="1.3"/>
            <path d="M26 55 L28 72" stroke="#2a2a2a" strokeWidth="1.3"/>
          </g>

          {/* Personne 6 - En bas droite */}
          <g transform="translate(190, 260) scale(0.6)">
            <circle cx="20" cy="10" r="7" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M10 18 L30 18 L32 60 L8 60 Z" stroke="#2a2a2a" strokeWidth="1.3" fill="none"/>
            <path d="M15 60 L14 78" stroke="#2a2a2a" strokeWidth="1.3"/>
            <path d="M25 60 L26 78" stroke="#2a2a2a" strokeWidth="1.3"/>
          </g>

          {/* Logo LOOKUP au centre */}
          <g transform="translate(150, 180)">
            <circle cx="0" cy="0" r="16" fill="#E8A0A0"/>
            <path
              d="M0 -8 C-4 -8 -6.5 -5 -6.5 -1.5 C-6.5 3 0 9 0 9 C0 9 6.5 3 6.5 -1.5 C6.5 -5 4 -8 0 -8 Z"
              fill="white"
            />
            <circle cx="0" cy="-2.5" r="2" fill="#E8A0A0"/>
          </g>

          {/* Lignes supplementaires pour les chemins */}
          <g stroke="#e8e8e8" strokeWidth="0.8" fill="none">
            <path d="M75 100 Q100 140 150 175"/>
            <path d="M225 100 Q200 140 150 175"/>
            <path d="M50 200 Q90 190 145 180"/>
            <path d="M250 195 Q210 188 155 180"/>
          </g>
        </svg>

        {/* Texte */}
        <div className="mt-6 text-center">
          <h1 className="text-[22px] font-bold text-lookup-black leading-snug">
            Vous avez croise un style ?
          </h1>
          <h2 className="text-[22px] font-bold text-lookup-mint-dark mt-0.5">
            Retrouvez-le.
          </h2>
          <p className="text-lookup-gray text-sm mt-3 max-w-[260px] mx-auto leading-relaxed">
            Decouvrez les tenues des personnes que vous croisez dans la rue.
          </p>
        </div>
      </div>

      {/* Boutons */}
      <div className="px-6 pb-8 pt-4 space-y-3">
        <Link
          to="/register"
          className="block w-full bg-lookup-mint text-white font-semibold py-4 rounded-full text-center active:scale-[0.98] transition-transform"
        >
          Commencer
        </Link>
        <Link
          to="/login"
          className="block w-full bg-white text-lookup-black font-semibold py-4 rounded-full text-center border border-gray-200 active:scale-[0.98] transition-transform"
        >
          J'ai deja un compte
        </Link>
        <p className="text-[10px] text-gray-400 text-center pt-2">
          En continuant, vous acceptez nos conditions generales.
        </p>
      </div>
    </div>
  )
}
