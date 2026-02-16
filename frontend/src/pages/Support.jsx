import { useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Mail, MessageCircle, Shield, HelpCircle } from 'lucide-react'

export default function Support() {
  const navigate = useNavigate()

  const faqs = [
    {
      q: "Comment fonctionne LOOKUP ?",
      a: "LOOKUP detecte quand deux utilisateurs se croisent dans la rue. Si chacun a poste son look du jour, il apparait dans l'app de l'autre. Ouvre l'app quand tu veux pour decouvrir les looks des gens que tu as croises."
    },
    {
      q: "Pourquoi LOOKUP a besoin de ma localisation ?",
      a: "La geolocalisation est essentielle pour detecter les croisements avec d'autres utilisateurs. Tes coordonnees exactes ne sont jamais partagees — seul le croisement est enregistre."
    },
    {
      q: "Comment poster un look ?",
      a: "Appuie sur le bouton + en bas de l'ecran, prends une photo ou choisis-en une depuis ta galerie, ajoute un titre et publie."
    },
    {
      q: "Comment supprimer mon compte ?",
      a: "Va dans Profil > Parametres > Supprimer mon compte. Toutes tes donnees seront supprimees definitivement (photos, looks, croisements)."
    },
    {
      q: "Mes donnees sont-elles protegees ?",
      a: "Oui. Nous ne partageons jamais tes donnees personnelles avec des tiers. Tu peux consulter notre politique de confidentialite pour plus de details."
    },
    {
      q: "Comment signaler un contenu inapproprie ?",
      a: "Sur le profil ou le look concerne, appuie sur les trois points puis 'Signaler'. Notre equipe examinera le signalement dans les plus brefs delais."
    },
    {
      q: "Comment rendre mon profil prive ?",
      a: "Va dans Profil > Parametres et active l'option 'Profil prive'. Les nouveaux abonnes devront envoyer une demande que tu pourras accepter ou refuser."
    }
  ]

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
        <h1 className="text-2xl font-bold text-lookup-black mb-2">Support</h1>
        <p className="text-sm text-lookup-gray mb-8">
          Besoin d'aide ? Trouve ta reponse ci-dessous ou contacte-nous directement.
        </p>

        {/* Contact */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
              <Mail size={18} className="text-lookup-mint-dark" />
            </div>
            <div>
              <p className="font-semibold text-lookup-black text-sm">Nous contacter</p>
              <a href="mailto:contact@lookup-app.fr" className="text-lookup-mint-dark text-sm">
                contact@lookup-app.fr
              </a>
            </div>
          </div>
          <p className="text-xs text-lookup-gray">
            Nous repondons generalement sous 24 heures.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-lookup-black" />
            <h2 className="text-lg font-bold text-lookup-black">Questions frequentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-2xl shadow-sm group">
                <summary className="p-4 cursor-pointer list-none flex items-center justify-between">
                  <span className="font-medium text-sm text-lookup-black pr-4">{faq.q}</span>
                  <ChevronLeft size={16} className="text-lookup-gray transform -rotate-90 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-sm text-lookup-gray">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/cgu')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <MessageCircle size={18} className="text-lookup-gray" />
            <span className="text-sm font-medium text-lookup-black">Conditions generales d'utilisation</span>
          </button>
          <button
            onClick={() => navigate('/privacy')}
            className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
          >
            <Shield size={18} className="text-lookup-gray" />
            <span className="text-sm font-medium text-lookup-black">Politique de confidentialite</span>
          </button>
        </div>

        {/* Version */}
        <div className="text-center mt-8">
          <p className="text-xs text-lookup-gray">LOOKUP v1.0</p>
        </div>
      </div>
    </div>
  )
}
