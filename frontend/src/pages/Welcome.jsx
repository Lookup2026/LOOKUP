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
      <div className="flex-1 flex flex-col items-center px-4">
        <svg
          viewBox="0 0 320 420"
          className="w-full max-w-[300px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Homme - gauche, de dos, en train de marcher, main a la tete */}
          <g transform="translate(70, 35)">
            {/* Tete */}
            <ellipse cx="28" cy="12" rx="10" ry="11" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Cheveux */}
            <path d="M18 8 Q28 2 38 8 L36 12 Q28 8 20 12 Z" fill="#1a1a1a"/>
            {/* Bras droit leve vers la tete */}
            <path d="M40 10 Q50 8 52 16 Q53 24 48 30" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Main sur la tete */}
            <ellipse cx="48" cy="12" rx="4" ry="5" stroke="#1a1a1a" strokeWidth="1.5" fill="none"/>
            {/* Corps - veste/hoodie avec couleur subtile */}
            <path d="M14 24 Q20 20 28 20 Q36 20 42 24 L44 70 Q36 72 28 72 Q20 72 12 70 Z"
                  stroke="#1a1a1a" strokeWidth="1.8" fill="#FDF2F2"/>
            {/* Col/capuche */}
            <path d="M20 24 Q28 28 36 24" stroke="#1a1a1a" strokeWidth="1.2" fill="none"/>
            {/* Bras gauche */}
            <path d="M14 26 Q6 40 10 58" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Jambe gauche (en avant) */}
            <path d="M20 70 L14 110" stroke="#1a1a1a" strokeWidth="2.5"/>
            {/* Jambe droite (en arriere) */}
            <path d="M36 70 L44 105" stroke="#1a1a1a" strokeWidth="2.5"/>
            {/* Pied gauche */}
            <ellipse cx="12" cy="113" rx="6" ry="3" fill="#1a1a1a"/>
            {/* Pied droit */}
            <ellipse cx="46" cy="108" rx="6" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Femme - droite, de dos, en train de marcher, cheveux au vent */}
          <g transform="translate(190, 35)">
            {/* Tete */}
            <ellipse cx="28" cy="12" rx="9" ry="10" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Cheveux longs au vent */}
            <path d="M20 6 Q12 15 8 35 Q6 50 10 65" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            <path d="M22 8 Q16 18 14 40 Q12 55 15 68" stroke="#1a1a1a" strokeWidth="1.3" fill="none"/>
            <path d="M36 6 Q44 12 50 30 Q54 45 52 60" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            <path d="M34 8 Q40 15 45 35 Q48 50 46 62" stroke="#1a1a1a" strokeWidth="1.3" fill="none"/>
            {/* Corps - long manteau */}
            <path d="M16 22 Q22 18 28 18 Q34 18 40 22 L44 95 Q36 98 28 98 Q20 98 12 95 Z"
                  stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Bras gauche */}
            <path d="M16 24 Q8 45 12 70" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Bras droit */}
            <path d="M40 24 Q48 45 44 70" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
            {/* Jambe gauche (en arriere) */}
            <path d="M22 95 L16 108" stroke="#1a1a1a" strokeWidth="2"/>
            {/* Jambe droite (en avant) */}
            <path d="M34 95 L40 115" stroke="#1a1a1a" strokeWidth="2"/>
            {/* Pieds */}
            <ellipse cx="14" cy="110" rx="5" ry="3" fill="#1a1a1a"/>
            <ellipse cx="42" cy="118" rx="5" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Traces de pas - gauche vers centre */}
          <g fill="#9ca3af">
            <ellipse cx="85" cy="175" rx="5" ry="8" transform="rotate(25 85 175)"/>
            <ellipse cx="95" cy="170" rx="4" ry="6" transform="rotate(25 95 170)"/>

            <ellipse cx="100" cy="205" rx="5" ry="8" transform="rotate(20 100 205)"/>
            <ellipse cx="110" cy="200" rx="4" ry="6" transform="rotate(20 110 200)"/>

            <ellipse cx="115" cy="235" rx="5" ry="8" transform="rotate(15 115 235)"/>
            <ellipse cx="125" cy="231" rx="4" ry="6" transform="rotate(15 125 231)"/>

            <ellipse cx="130" cy="265" rx="5" ry="8" transform="rotate(8 130 265)"/>
            <ellipse cx="140" cy="262" rx="4" ry="6" transform="rotate(8 140 262)"/>

            <ellipse cx="145" cy="295" rx="5" ry="8" transform="rotate(3 145 295)"/>
            <ellipse cx="155" cy="293" rx="4" ry="6" transform="rotate(3 155 293)"/>
          </g>

          {/* Traces de pas - droite vers centre */}
          <g fill="#9ca3af">
            <ellipse cx="235" cy="175" rx="5" ry="8" transform="rotate(-25 235 175)"/>
            <ellipse cx="225" cy="170" rx="4" ry="6" transform="rotate(-25 225 170)"/>

            <ellipse cx="220" cy="205" rx="5" ry="8" transform="rotate(-20 220 205)"/>
            <ellipse cx="210" cy="200" rx="4" ry="6" transform="rotate(-20 210 200)"/>

            <ellipse cx="205" cy="235" rx="5" ry="8" transform="rotate(-15 205 235)"/>
            <ellipse cx="195" cy="231" rx="4" ry="6" transform="rotate(-15 195 231)"/>

            <ellipse cx="190" cy="265" rx="5" ry="8" transform="rotate(-8 190 265)"/>
            <ellipse cx="180" cy="262" rx="4" ry="6" transform="rotate(-8 180 262)"/>

            <ellipse cx="175" cy="295" rx="5" ry="8" transform="rotate(-3 175 295)"/>
            <ellipse cx="165" cy="293" rx="4" ry="6" transform="rotate(-3 165 293)"/>
          </g>

          {/* Logo LOOKUP au croisement */}
          <g transform="translate(160, 320)">
            <circle cx="0" cy="0" r="18" fill="#E8A0A0"/>
            <path
              d="M0 -9 C-4.5 -9 -7 -5.5 -7 -2 C-7 3.5 0 10 0 10 C0 10 7 3.5 7 -2 C7 -5.5 4.5 -9 0 -9 Z"
              fill="white"
            />
            <circle cx="0" cy="-3" r="2.5" fill="#E8A0A0"/>
          </g>

          {/* Traces de pas apres croisement - vers bas gauche */}
          <g fill="#9ca3af">
            <ellipse cx="140" cy="355" rx="5" ry="8" transform="rotate(-20 140 355)"/>
            <ellipse cx="130" cy="352" rx="4" ry="6" transform="rotate(-20 130 352)"/>

            <ellipse cx="115" cy="385" rx="5" ry="8" transform="rotate(-28 115 385)"/>
            <ellipse cx="105" cy="382" rx="4" ry="6" transform="rotate(-28 105 382)"/>

            <ellipse cx="85" cy="412" rx="5" ry="8" transform="rotate(-35 85 412)"/>
            <ellipse cx="75" cy="409" rx="4" ry="6" transform="rotate(-35 75 409)"/>
          </g>

          {/* Traces de pas apres croisement - vers bas droite */}
          <g fill="#9ca3af">
            <ellipse cx="180" cy="355" rx="5" ry="8" transform="rotate(20 180 355)"/>
            <ellipse cx="190" cy="352" rx="4" ry="6" transform="rotate(20 190 352)"/>

            <ellipse cx="205" cy="385" rx="5" ry="8" transform="rotate(28 205 385)"/>
            <ellipse cx="215" cy="382" rx="4" ry="6" transform="rotate(28 215 382)"/>

            <ellipse cx="235" cy="412" rx="5" ry="8" transform="rotate(35 235 412)"/>
            <ellipse cx="245" cy="409" rx="4" ry="6" transform="rotate(35 245 409)"/>
          </g>
        </svg>

        {/* Texte */}
        <div className="mt-2 text-center">
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
