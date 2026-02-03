import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin } from 'lucide-react'

export default function CGU() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-lookup-cream pb-8">
      {/* Header */}
      <div className="glass-strong px-4 pb-3 rounded-b-3xl shadow-glass sticky top-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black">LOOKUP</span>
          </div>
          <div className="w-9"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-bold text-lookup-black mb-6">Conditions Generales d'Utilisation</h1>

        <div className="space-y-6 text-sm text-lookup-gray">
          <p className="text-xs text-lookup-gray">Derniere mise a jour : Fevrier 2025</p>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">1. Presentation</h2>
            <p>
              LOOKUP est une application mobile permettant de partager ses looks vestimentaires et de decouvrir
              ceux des personnes croisees dans la rue grace a la geolocalisation.
            </p>
            <p className="mt-2">
              L'application est editee par Gabriel Azoulay, ci-apres "l'Editeur".
            </p>
            <p className="mt-2">
              Contact : look79987@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">2. Acceptation des conditions</h2>
            <p>
              L'utilisation de LOOKUP implique l'acceptation pleine et entiere des presentes conditions generales
              d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">3. Inscription et compte</h2>
            <p>Pour utiliser LOOKUP, vous devez :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Etre age d'au moins 13 ans</li>
              <li>Fournir des informations exactes lors de l'inscription</li>
              <li>Maintenir la confidentialite de vos identifiants</li>
              <li>Etre responsable de toute activite sur votre compte</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">4. Utilisation du service</h2>
            <p>En utilisant LOOKUP, vous vous engagez a :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Ne pas publier de contenu illegal, offensant, diffamatoire ou pornographique</li>
              <li>Respecter les droits de propriete intellectuelle</li>
              <li>Ne pas harceler d'autres utilisateurs</li>
              <li>Ne pas utiliser l'application a des fins commerciales non autorisees</li>
              <li>Ne pas tenter de contourner les mesures de securite</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">5. Contenu utilisateur</h2>
            <p>
              Vous conservez vos droits sur les photos et contenus que vous publiez. Toutefois, en publiant
              du contenu sur LOOKUP, vous accordez a l'Editeur une licence non exclusive, mondiale et gratuite
              pour afficher ce contenu dans le cadre du fonctionnement de l'application.
            </p>
            <p className="mt-2">
              L'Editeur se reserve le droit de supprimer tout contenu contraire aux presentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">6. Geolocalisation</h2>
            <p>
              LOOKUP utilise la geolocalisation pour detecter les croisements avec d'autres utilisateurs.
              Cette fonctionnalite est essentielle au service. Vous pouvez desactiver la localisation dans
              les parametres de votre telephone, mais cela limitera les fonctionnalites de l'application.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">7. Signalement et moderation</h2>
            <p>
              Vous pouvez signaler tout contenu ou utilisateur inapproprie. L'Editeur s'engage a traiter
              les signalements dans les meilleurs delais et peut prendre des mesures allant de l'avertissement
              a la suppression definitive du compte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">8. Limitation de responsabilite</h2>
            <p>
              L'Editeur ne peut etre tenu responsable des contenus publies par les utilisateurs, ni des
              interactions entre utilisateurs. L'application est fournie "en l'etat" sans garantie d'aucune sorte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">9. Modification des conditions</h2>
            <p>
              L'Editeur se reserve le droit de modifier les presentes conditions. Les utilisateurs seront
              informes des modifications importantes. La poursuite de l'utilisation apres modification
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">10. Resiliation</h2>
            <p>
              Vous pouvez supprimer votre compte a tout moment depuis les parametres de l'application.
              L'Editeur peut egalement suspendre ou supprimer votre compte en cas de violation des presentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">11. Droit applicable</h2>
            <p>
              Les presentes conditions sont soumises au droit francais. Tout litige sera soumis aux tribunaux
              competents de Paris, France.
            </p>
          </section>

          <section className="pt-4 border-t border-lookup-gray-light">
            <p className="text-xs">
              Pour toute question concernant ces conditions, contactez-nous a : look79987@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
