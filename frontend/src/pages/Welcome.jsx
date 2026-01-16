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
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <svg
          viewBox="0 0 280 400"
          className="w-full max-w-[260px] h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Personne 1 - Gauche (homme de dos, style minimaliste) */}
          <g transform="translate(45, 10)" stroke="#1a1a1a" strokeWidth="1.2" fill="none">
            {/* Tete */}
            <ellipse cx="25" cy="12" rx="8" ry="9"/>
            {/* Cheveux courts */}
            <path d="M17 9 Q25 3 33 9"/>
            {/* Main vers la tete */}
            <path d="M35 8 Q42 5 44 12 Q45 18 40 22"/>
            {/* Corps - veste ROSE */}
            <path d="M12 22 L38 22 L42 75 L8 75 Z" fill="#E8A0A0" stroke="#1a1a1a"/>
            {/* Bras gauche */}
            <path d="M12 22 Q4 40 8 60"/>
            {/* Bras droit (leve vers tete) */}
            <path d="M38 22 Q44 20 40 22"/>
            {/* Jambes */}
            <line x1="15" y1="75" x2="12" y2="115"/>
            <line x1="35" y1="75" x2="38" y2="115"/>
            {/* Pieds */}
            <ellipse cx="12" cy="118" rx="5" ry="3" fill="#1a1a1a"/>
            <ellipse cx="38" cy="118" rx="5" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Personne 2 - Droite (femme de dos, style minimaliste) */}
          <g transform="translate(175, 10)" stroke="#1a1a1a" strokeWidth="1.2" fill="none">
            {/* Tete */}
            <ellipse cx="25" cy="11" rx="7" ry="8"/>
            {/* Cheveux longs fluides */}
            <path d="M18 10 Q14 25 16 50"/>
            <path d="M20 12 Q17 28 19 48"/>
            <path d="M32 10 Q36 25 34 50"/>
            <path d="M30 12 Q33 28 31 48"/>
            {/* Corps - manteau */}
            <path d="M14 20 L36 20 L40 90 L10 90 Z"/>
            {/* Bras */}
            <path d="M14 22 Q6 45 10 70"/>
            <path d="M36 22 Q44 45 40 70"/>
            {/* Jambes */}
            <line x1="18" y1="90" x2="16" y2="115"/>
            <line x1="32" y1="90" x2="34" y2="115"/>
            {/* Pieds */}
            <ellipse cx="16" cy="118" rx="4" ry="3" fill="#1a1a1a"/>
            <ellipse cx="34" cy="118" rx="4" ry="3" fill="#1a1a1a"/>
          </g>

          {/* Traces de pas - Gauche vers centre (formant un X) */}
          <g fill="#9ca3af">
            {/* Paire 1 */}
            <ellipse cx="55" cy="155" rx="4" ry="7" transform="rotate(20 55 155)"/>
            <ellipse cx="65" cy="152" rx="3" ry="5" transform="rotate(20 65 152)"/>
            {/* Paire 2 */}
            <ellipse cx="70" cy="180" rx="4" ry="7" transform="rotate(15 70 180)"/>
            <ellipse cx="80" cy="177" rx="3" ry="5" transform="rotate(15 80 177)"/>
            {/* Paire 3 */}
            <ellipse cx="88" cy="205" rx="4" ry="7" transform="rotate(10 88 205)"/>
            <ellipse cx="98" cy="203" rx="3" ry="5" transform="rotate(10 98 203)"/>
            {/* Paire 4 */}
            <ellipse cx="105" cy="232" rx="4" ry="7" transform="rotate(5 105 232)"/>
            <ellipse cx="115" cy="230" rx="3" ry="5" transform="rotate(5 115 230)"/>
            {/* Paire 5 */}
            <ellipse cx="122" cy="260" rx="4" ry="7" transform="rotate(2 122 260)"/>
            <ellipse cx="132" cy="258" rx="3" ry="5" transform="rotate(2 132 258)"/>
          </g>

          {/* Traces de pas - Droite vers centre (formant un X) */}
          <g fill="#9ca3af">
            {/* Paire 1 */}
            <ellipse cx="225" cy="155" rx="4" ry="7" transform="rotate(-20 225 155)"/>
            <ellipse cx="215" cy="152" rx="3" ry="5" transform="rotate(-20 215 152)"/>
            {/* Paire 2 */}
            <ellipse cx="210" cy="180" rx="4" ry="7" transform="rotate(-15 210 180)"/>
            <ellipse cx="200" cy="177" rx="3" ry="5" transform="rotate(-15 200 177)"/>
            {/* Paire 3 */}
            <ellipse cx="192" cy="205" rx="4" ry="7" transform="rotate(-10 192 205)"/>
            <ellipse cx="182" cy="203" rx="3" ry="5" transform="rotate(-10 182 203)"/>
            {/* Paire 4 */}
            <ellipse cx="175" cy="232" rx="4" ry="7" transform="rotate(-5 175 232)"/>
            <ellipse cx="165" cy="230" rx="3" ry="5" transform="rotate(-5 165 230)"/>
            {/* Paire 5 */}
            <ellipse cx="158" cy="260" rx="4" ry="7" transform="rotate(-2 158 260)"/>
            <ellipse cx="148" cy="258" rx="3" ry="5" transform="rotate(-2 148 258)"/>
          </g>

          {/* Logo LOOKUP au croisement */}
          <g transform="translate(140, 290)">
            <circle cx="0" cy="0" r="18" fill="#E8A0A0"/>
            {/* MapPin icon */}
            <path
              d="M0 -10 C-5 -10 -8 -6 -8 -2 C-8 4 0 11 0 11 C0 11 8 4 8 -2 C8 -6 5 -10 0 -10 Z"
              fill="white"
            />
            <circle cx="0" cy="-3" r="2.5" fill="#E8A0A0"/>
          </g>

          {/* Traces de pas continuant apres le croisement - vers bas gauche */}
          <g fill="#9ca3af">
            <ellipse cx="118" cy="320" rx="4" ry="7" transform="rotate(-15 118 320)"/>
            <ellipse cx="108" cy="318" rx="3" ry="5" transform="rotate(-15 108 318)"/>
            <ellipse cx="95" cy="345" rx="4" ry="7" transform="rotate(-20 95 345)"/>
            <ellipse cx="85" cy="343" rx="3" ry="5" transform="rotate(-20 85 343)"/>
            <ellipse cx="70" cy="372" rx="4" ry="7" transform="rotate(-25 70 372)"/>
            <ellipse cx="60" cy="370" rx="3" ry="5" transform="rotate(-25 60 370)"/>
          </g>

          {/* Traces de pas continuant apres le croisement - vers bas droite */}
          <g fill="#9ca3af">
            <ellipse cx="162" cy="320" rx="4" ry="7" transform="rotate(15 162 320)"/>
            <ellipse cx="172" cy="318" rx="3" ry="5" transform="rotate(15 172 318)"/>
            <ellipse cx="185" cy="345" rx="4" ry="7" transform="rotate(20 185 345)"/>
            <ellipse cx="195" cy="343" rx="3" ry="5" transform="rotate(20 195 343)"/>
            <ellipse cx="210" cy="372" rx="4" ry="7" transform="rotate(25 210 372)"/>
            <ellipse cx="220" cy="370" rx="3" ry="5" transform="rotate(25 220 370)"/>
          </g>
        </svg>

        {/* Texte */}
        <div className="mt-4 text-center">
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
