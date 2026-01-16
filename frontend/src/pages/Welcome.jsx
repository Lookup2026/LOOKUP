import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo en haut */}
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
          viewBox="0 0 320 380"
          className="w-full max-w-[300px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Personne 1 - Gauche (homme style fashion) */}
          <g transform="translate(35, 20)">
            {/* Tete */}
            <ellipse cx="30" cy="18" rx="14" ry="16" fill="none" stroke="#1a1a1a" strokeWidth="1.8"/>
            {/* Cheveux structures */}
            <path d="M16 14 Q20 4 30 6 Q40 4 44 14" stroke="#1a1a1a" strokeWidth="2" fill="#1a1a1a"/>
            <path d="M18 16 Q30 10 42 16" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Cou */}
            <path d="M24 32 L24 40 M36 32 L36 40" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Epaules et veste - ROSE */}
            <path d="M8 42 Q15 38 24 40 L36 40 Q45 38 52 42 L56 50 L56 105 Q45 108 30 108 Q15 108 4 105 L4 50 Z"
                  fill="#E8A0A0" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Details veste - col */}
            <path d="M20 40 L26 55 L30 50 L34 55 L40 40" stroke="#1a1a1a" strokeWidth="1.2" fill="none"/>
            {/* Poches */}
            <rect x="10" y="75" width="14" height="12" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            <rect x="36" y="75" width="14" height="12" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            {/* Bras gauche avec main dans poche */}
            <path d="M4 50 Q-4 70 6 90" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            <path d="M6 90 L10 82" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Bras droit */}
            <path d="M56 50 Q64 70 58 95" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            <ellipse cx="58" cy="98" rx="4" ry="5" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
            {/* Pantalon */}
            <path d="M12 105 L12 108 L8 165" stroke="#1a1a1a" strokeWidth="3"/>
            <path d="M48 105 L48 108 L52 165" stroke="#1a1a1a" strokeWidth="3"/>
            {/* Chaussures detaillees */}
            <path d="M2 165 L8 165 L10 172 L0 172 Z" fill="#1a1a1a"/>
            <path d="M50 165 L56 165 L58 172 L48 172 Z" fill="#1a1a1a"/>
          </g>

          {/* Personne 2 - Droite (femme style fashion) */}
          <g transform="translate(205, 20)">
            {/* Tete */}
            <ellipse cx="30" cy="16" rx="12" ry="14" fill="none" stroke="#1a1a1a" strokeWidth="1.8"/>
            {/* Cheveux longs ondules */}
            <path d="M18 12 Q12 20 10 40 Q8 60 12 75" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
            <path d="M20 14 Q16 25 14 45 Q12 65 16 78" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M42 12 Q48 20 50 40 Q52 60 48 75" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
            <path d="M40 14 Q44 25 46 45 Q48 65 44 78" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M20 8 Q30 2 40 8" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Cou */}
            <path d="M26 28 L26 36 M34 28 L34 36" stroke="#1a1a1a" strokeWidth="1.2"/>
            {/* Manteau long elegant */}
            <path d="M10 38 Q18 34 30 36 Q42 34 50 38 L54 45 L58 130 Q45 134 30 134 Q15 134 2 130 L6 45 Z"
                  fill="none" stroke="#1a1a1a" strokeWidth="1.8"/>
            {/* Col du manteau */}
            <path d="M14 38 L22 52 M46 38 L38 52" stroke="#1a1a1a" strokeWidth="1.5"/>
            {/* Ceinture */}
            <line x1="6" y1="85" x2="54" y2="85" stroke="#1a1a1a" strokeWidth="2"/>
            <rect x="26" y="82" width="8" height="6" fill="none" stroke="#1a1a1a" strokeWidth="1"/>
            {/* Boutons */}
            <circle cx="30" cy="60" r="2" fill="#1a1a1a"/>
            <circle cx="30" cy="72" r="2" fill="#1a1a1a"/>
            {/* Bras avec sac */}
            <path d="M6 45 Q-2 65 4 85" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            <path d="M54 45 Q62 65 56 90" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Sac a main */}
            <rect x="56" y="75" width="12" height="16" rx="2" fill="none" stroke="#1a1a1a" strokeWidth="1.5"/>
            <path d="M58 75 Q62 68 66 75" stroke="#1a1a1a" strokeWidth="1.2" fill="none"/>
            {/* Jambes */}
            <path d="M20 134 L18 175" stroke="#1a1a1a" strokeWidth="2.5"/>
            <path d="M40 134 L42 175" stroke="#1a1a1a" strokeWidth="2.5"/>
            {/* Talons */}
            <path d="M14 175 L22 175 L22 180 L18 184 L14 180 Z" fill="#1a1a1a"/>
            <path d="M38 175 L46 175 L46 180 L42 184 L38 180 Z" fill="#1a1a1a"/>
          </g>

          {/* Traces de pas - Plus elaborees - Gauche */}
          <g fill="#c9c9c9" stroke="#b0b0b0" strokeWidth="0.5">
            <ellipse cx="25" cy="360" rx="5" ry="8" transform="rotate(-35 25 360)"/>
            <ellipse cx="35" cy="354" rx="4" ry="6" transform="rotate(-35 35 354)"/>

            <ellipse cx="50" cy="335" rx="5" ry="8" transform="rotate(-30 50 335)"/>
            <ellipse cx="60" cy="329" rx="4" ry="6" transform="rotate(-30 60 329)"/>

            <ellipse cx="78" cy="308" rx="5" ry="8" transform="rotate(-22 78 308)"/>
            <ellipse cx="88" cy="302" rx="4" ry="6" transform="rotate(-22 88 302)"/>

            <ellipse cx="105" cy="282" rx="5" ry="8" transform="rotate(-12 105 282)"/>
            <ellipse cx="115" cy="278" rx="4" ry="6" transform="rotate(-12 115 278)"/>

            <ellipse cx="132" cy="260" rx="5" ry="8" transform="rotate(-5 132 260)"/>
            <ellipse cx="142" cy="257" rx="4" ry="6" transform="rotate(-5 142 257)"/>
          </g>

          {/* Traces de pas - Droite */}
          <g fill="#c9c9c9" stroke="#b0b0b0" strokeWidth="0.5">
            <ellipse cx="295" cy="360" rx="5" ry="8" transform="rotate(35 295 360)"/>
            <ellipse cx="285" cy="354" rx="4" ry="6" transform="rotate(35 285 354)"/>

            <ellipse cx="270" cy="335" rx="5" ry="8" transform="rotate(30 270 335)"/>
            <ellipse cx="260" cy="329" rx="4" ry="6" transform="rotate(30 260 329)"/>

            <ellipse cx="242" cy="308" rx="5" ry="8" transform="rotate(22 242 308)"/>
            <ellipse cx="232" cy="302" rx="4" ry="6" transform="rotate(22 232 302)"/>

            <ellipse cx="215" cy="282" rx="5" ry="8" transform="rotate(12 215 282)"/>
            <ellipse cx="205" cy="278" rx="4" ry="6" transform="rotate(12 205 278)"/>

            <ellipse cx="188" cy="260" rx="5" ry="8" transform="rotate(5 188 260)"/>
            <ellipse cx="178" cy="257" rx="4" ry="6" transform="rotate(5 178 257)"/>
          </g>

          {/* Logo LOOKUP au centre du croisement */}
          <g transform="translate(160, 240)">
            {/* Cercle de fond */}
            <circle cx="0" cy="0" r="22" fill="#E8A0A0"/>
            <circle cx="0" cy="0" r="22" fill="none" stroke="#D4817F" strokeWidth="2"/>
            {/* Icone MapPin */}
            <path
              d="M0 -12 C-6 -12 -10 -7 -10 -2 C-10 5 0 14 0 14 C0 14 10 5 10 -2 C10 -7 6 -12 0 -12 Z"
              fill="white"
            />
            <circle cx="0" cy="-3" r="3.5" fill="#E8A0A0"/>
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
          <p className="text-lookup-gray text-sm mt-3 max-w-[270px] mx-auto leading-relaxed">
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
