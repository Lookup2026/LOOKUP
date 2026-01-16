import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo - petit et discret en haut */}
      <div className="pt-8 pb-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-7 h-7 bg-lookup-mint rounded-full flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-lg font-semibold text-lookup-black tracking-tight">LOOKUP</span>
        </div>
      </div>

      {/* Illustration principale */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <svg
          viewBox="0 0 300 320"
          className="w-full max-w-[280px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Personne 1 - Gauche (homme de dos) */}
          <g transform="translate(45, 40)">
            {/* Tete */}
            <ellipse cx="25" cy="12" rx="10" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Cheveux */}
            <path d="M15 8 Q25 0 35 8" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Corps - Veste ROSE (couleur app) */}
            <path d="M10 28 L15 24 L35 24 L40 28 L42 70 L25 72 L8 70 Z" fill="#E8A0A0" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Bras gauche */}
            <path d="M10 28 Q2 45 8 65" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Bras droit */}
            <path d="M40 28 Q48 45 42 65" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Pantalon */}
            <path d="M12 70 L10 115" stroke="#1a1a1a" strokeWidth="2.5"/>
            <path d="M38 70 L40 115" stroke="#1a1a1a" strokeWidth="2.5"/>
            {/* Pieds */}
            <ellipse cx="10" cy="118" rx="5" ry="3" fill="#1a1a1a"/>
            <ellipse cx="40" cy="118" rx="5" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Personne 2 - Droite (femme de dos) */}
          <g transform="translate(195, 40)">
            {/* Tete */}
            <ellipse cx="25" cy="12" rx="9" ry="11" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Cheveux longs */}
            <path d="M16 10 Q10 25 14 45" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M34 10 Q40 25 36 45" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M18 8 Q25 2 32 8" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Manteau */}
            <path d="M12 24 L38 24 L42 90 L8 90 Z" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Bras */}
            <path d="M12 26 Q4 50 10 70" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M38 26 Q46 50 40 70" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Jambes */}
            <path d="M18 90 L16 115" stroke="#1a1a1a" strokeWidth="2"/>
            <path d="M32 90 L34 115" stroke="#1a1a1a" strokeWidth="2"/>
            {/* Pieds */}
            <ellipse cx="16" cy="118" rx="4" ry="3" fill="#1a1a1a"/>
            <ellipse cx="34" cy="118" rx="4" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Traces de pas - chemin gauche vers centre */}
          <g fill="#d1d5db">
            {/* Pas venant du bas gauche */}
            <ellipse cx="30" cy="300" rx="4" ry="6" transform="rotate(-30 30 300)"/>
            <ellipse cx="38" cy="295" rx="3" ry="5" transform="rotate(-30 38 295)"/>

            <ellipse cx="50" cy="280" rx="4" ry="6" transform="rotate(-25 50 280)"/>
            <ellipse cx="58" cy="275" rx="3" ry="5" transform="rotate(-25 58 275)"/>

            <ellipse cx="72" cy="258" rx="4" ry="6" transform="rotate(-20 72 258)"/>
            <ellipse cx="80" cy="253" rx="3" ry="5" transform="rotate(-20 80 253)"/>

            <ellipse cx="95" cy="238" rx="4" ry="6" transform="rotate(-15 95 238)"/>
            <ellipse cx="103" cy="234" rx="3" ry="5" transform="rotate(-15 103 234)"/>

            <ellipse cx="118" cy="220" rx="4" ry="6" transform="rotate(-5 118 220)"/>
            <ellipse cx="126" cy="217" rx="3" ry="5" transform="rotate(-5 126 217)"/>
          </g>

          {/* Traces de pas - chemin droite vers centre */}
          <g fill="#d1d5db">
            {/* Pas venant du bas droite */}
            <ellipse cx="270" cy="300" rx="4" ry="6" transform="rotate(30 270 300)"/>
            <ellipse cx="262" cy="295" rx="3" ry="5" transform="rotate(30 262 295)"/>

            <ellipse cx="250" cy="280" rx="4" ry="6" transform="rotate(25 250 280)"/>
            <ellipse cx="242" cy="275" rx="3" ry="5" transform="rotate(25 242 275)"/>

            <ellipse cx="228" cy="258" rx="4" ry="6" transform="rotate(20 228 258)"/>
            <ellipse cx="220" cy="253" rx="3" ry="5" transform="rotate(20 220 253)"/>

            <ellipse cx="205" cy="238" rx="4" ry="6" transform="rotate(15 205 238)"/>
            <ellipse cx="197" cy="234" rx="3" ry="5" transform="rotate(15 197 234)"/>

            <ellipse cx="182" cy="220" rx="4" ry="6" transform="rotate(5 182 220)"/>
            <ellipse cx="174" cy="217" rx="3" ry="5" transform="rotate(5 174 217)"/>
          </g>

          {/* Point de croisement - coeur ou icone */}
          <g transform="translate(150, 200)">
            {/* Coeur */}
            <path
              d="M0 8 C0 4, -6 0, -8 4 C-10 8, -6 14, 0 18 C6 14, 10 8, 8 4 C6 0, 0 4, 0 8 Z"
              fill="#E8A0A0"
              transform="translate(0, -5) scale(1.2)"
            />
          </g>
        </svg>

        {/* Texte */}
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold text-lookup-black leading-snug">
            Vous avez croise un style ?
          </h1>
          <h2 className="text-2xl font-bold text-lookup-mint-dark mt-1">
            Retrouvez-le.
          </h2>
          <p className="text-lookup-gray text-sm mt-4 max-w-[260px] mx-auto leading-relaxed">
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
