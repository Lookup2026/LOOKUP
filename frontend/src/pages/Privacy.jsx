import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin } from 'lucide-react'

export default function Privacy() {
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
        <h1 className="text-2xl font-bold text-lookup-black mb-6">Politique de Confidentialite</h1>

        <div className="space-y-6 text-sm text-lookup-gray">
          <p className="text-xs text-lookup-gray">Derniere mise a jour : Fevrier 2026</p>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">1. Introduction</h2>
            <p>
              La presente politique de confidentialite explique comment LOOKUP collecte, utilise et protege
              vos donnees personnelles conformement au Reglement General sur la Protection des Donnees (RGPD).
            </p>
            <p className="mt-2">
              Responsable du traitement : LOOKUP
            </p>
            <p>
              Contact : contact@lookup-app.fr
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">2. Donnees collectees</h2>
            <p>Nous collectons les donnees suivantes :</p>

            <h3 className="font-medium text-lookup-black mt-3 mb-1">Donnees d'inscription</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Adresse email</li>
              <li>Nom d'utilisateur</li>
              <li>Mot de passe (stocke de maniere chiffree)</li>
            </ul>

            <h3 className="font-medium text-lookup-black mt-3 mb-1">Donnees de profil</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Photo de profil (optionnelle)</li>
              <li>Biographie (optionnelle)</li>
            </ul>

            <h3 className="font-medium text-lookup-black mt-3 mb-1">Contenu utilisateur</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Photos de looks publiees</li>
              <li>Descriptions des looks</li>
              <li>Likes et interactions</li>
            </ul>

            <h3 className="font-medium text-lookup-black mt-3 mb-1">Donnees de localisation</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Position GPS en temps reel (avec votre consentement)</li>
              <li>Historique des croisements avec d'autres utilisateurs</li>
            </ul>

            <h3 className="font-medium text-lookup-black mt-3 mb-1">Donnees techniques</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Type d'appareil et systeme d'exploitation</li>
              <li>Adresse IP</li>
              <li>Donnees de connexion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">3. Finalites du traitement</h2>
            <p>Vos donnees sont utilisees pour :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Gerer votre compte et authentification</li>
              <li>Permettre la publication et l'affichage de vos looks</li>
              <li>Detecter les croisements avec d'autres utilisateurs</li>
              <li>Afficher les looks des personnes croisees</li>
              <li>Envoyer des notifications (likes, follows, croisements)</li>
              <li>Ameliorer et securiser le service</li>
              <li>Repondre a vos demandes de support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">4. Base legale</h2>
            <p>Le traitement de vos donnees repose sur :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Execution du contrat</strong> : pour fournir le service LOOKUP</li>
              <li><strong>Consentement</strong> : pour la geolocalisation et les notifications</li>
              <li><strong>Interet legitime</strong> : pour ameliorer et securiser le service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">5. Partage des donnees</h2>
            <p>
              Vos donnees ne sont pas vendues a des tiers. Elles peuvent etre partagees avec :
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Autres utilisateurs</strong> : votre profil, looks et informations publiques</li>
              <li><strong>Hebergeurs</strong> : Render (backend), Vercel (frontend) pour le fonctionnement technique</li>
              <li><strong>Autorites</strong> : si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">6. Duree de conservation</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Donnees de compte : conservees tant que le compte est actif</li>
              <li>Looks et photos : conservees jusqu'a suppression par l'utilisateur</li>
              <li>Donnees de localisation : conservees 24 heures pour les croisements</li>
              <li>Apres suppression du compte : donnees effacees sous 30 jours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">7. Vos droits (RGPD)</h2>
            <p>Conformement au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Acces</strong> : obtenir une copie de vos donnees</li>
              <li><strong>Rectification</strong> : corriger vos donnees inexactes</li>
              <li><strong>Effacement</strong> : supprimer vos donnees ("droit a l'oubli")</li>
              <li><strong>Portabilite</strong> : recevoir vos donnees dans un format structure</li>
              <li><strong>Opposition</strong> : vous opposer a certains traitements</li>
              <li><strong>Limitation</strong> : limiter le traitement de vos donnees</li>
              <li><strong>Retrait du consentement</strong> : a tout moment pour la localisation</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, contactez-nous a : contact@lookup-app.fr
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">8. Securite</h2>
            <p>
              Nous mettons en oeuvre des mesures techniques et organisationnelles pour proteger vos donnees :
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Chiffrement des mots de passe</li>
              <li>Communications securisees (HTTPS)</li>
              <li>Acces restreint aux donnees</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">9. Cookies</h2>
            <p>
              LOOKUP utilise des cookies techniques necessaires au fonctionnement de l'application
              (authentification, preferences). Aucun cookie publicitaire n'est utilise.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">10. Mineurs</h2>
            <p>
              LOOKUP est destine aux personnes de 13 ans et plus. Nous ne collectons pas sciemment
              de donnees concernant des enfants de moins de 13 ans.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">11. Modifications</h2>
            <p>
              Cette politique peut etre mise a jour. Les modifications importantes seront notifiees
              dans l'application. La date de derniere mise a jour est indiquee en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-lookup-black mb-2">12. Reclamation</h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectes, vous pouvez introduire une reclamation
              aupres de la CNIL (Commission Nationale de l'Informatique et des Libertes) : www.cnil.fr
            </p>
          </section>

          <section className="pt-4 border-t border-lookup-gray-light">
            <p className="text-xs">
              Pour toute question concernant cette politique, contactez-nous a : contact@lookup-app.fr
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
