import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Camera, MapPin, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { updateProfile, uploadAvatar, canChangeUsername, getPhotoUrl } from '../api/client'
import { compressImage } from '../utils/imageCompression'
import toast from 'react-hot-toast'

export default function EditProfile() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const avatarInputRef = useRef(null)

  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [canChangeUser, setCanChangeUser] = useState(true)
  const [daysRemaining, setDaysRemaining] = useState(0)

  useEffect(() => {
    checkUsernameChange()
  }, [])

  const checkUsernameChange = async () => {
    try {
      const { data } = await canChangeUsername()
      setCanChangeUser(data.can_change)
      setDaysRemaining(data.days_remaining)
    } catch (e) {
      // ignore
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Fichier image requis')
      return
    }

    setUploadingAvatar(true)
    try {
      // Compresser l'image (400px max pour un avatar)
      const compressedFile = await compressImage(file, 400, 0.85)

      const formData = new FormData()
      formData.append('photo', compressedFile)
      const { data } = await uploadAvatar(formData)
      setUser(data)
      toast.success('Photo mise a jour')
    } catch (error) {
      toast.error('Erreur lors du telechargement')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    // Valider le username
    if (username !== user?.username) {
      if (!canChangeUser) {
        toast.error(`Tu pourras changer ton nom dans ${daysRemaining} jours`)
        return
      }
      if (username.length < 3 || username.length > 20) {
        toast.error('Le nom doit contenir 3-20 caracteres')
        return
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        toast.error('Caracteres autorises : lettres, chiffres, underscore')
        return
      }
    }

    // Valider la bio
    if (bio.length > 150) {
      toast.error('La bio ne peut pas depasser 150 caracteres')
      return
    }

    setSaving(true)
    try {
      const updateData = {}
      if (username !== user?.username) {
        updateData.username = username
      }
      if (bio !== (user?.bio || '')) {
        updateData.bio = bio
      }

      if (Object.keys(updateData).length === 0) {
        toast('Aucun changement')
        setSaving(false)
        return
      }

      const { data } = await updateProfile(updateData)
      setUser(data)
      toast.success('Profil mis a jour')

      // Si le username a change, mettre a jour la restriction
      if (updateData.username) {
        setCanChangeUser(false)
        setDaysRemaining(15)
      }

      navigate(-1)
    } catch (error) {
      const msg = error.response?.data?.detail || 'Erreur lors de la mise a jour'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-full pb-24 bg-lookup-cream dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="glass-strong px-4 pb-3 rounded-b-3xl shadow-glass sticky top-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-lookup-cream dark:bg-neutral-800 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-lookup-gray" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="text-xl font-bold text-lookup-black dark:text-white">LOOKUP</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-lookup-mint font-semibold text-sm"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <h1 className="text-xl font-bold text-lookup-black dark:text-white mb-6">Modifier le profil</h1>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div
              className="relative cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              {user?.avatar_url ? (
                <img
                  src={getPhotoUrl(user.avatar_url)}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover border-4 border-lookup-mint"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lookup-mint to-lookup-mint-dark flex items-center justify-center text-white text-3xl font-bold border-4 border-lookup-mint">
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Camera overlay */}
              <div className={`absolute inset-0 rounded-full flex items-center justify-center transition ${uploadingAvatar ? 'bg-black/50' : 'bg-black/0 hover:bg-black/30'}`}>
                {uploadingAvatar ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera size={24} className="text-white opacity-0 hover:opacity-100 transition" />
                )}
              </div>
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-lookup-mint rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-lookup-black dark:text-white mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              disabled={!canChangeUser && username === user?.username}
              className="w-full bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-lookup-black dark:text-white border border-lookup-gray-light dark:border-neutral-700 focus:border-lookup-mint focus:outline-none disabled:opacity-50"
              placeholder="ton_username"
              maxLength={20}
            />
            {!canChangeUser && (
              <div className="flex items-center gap-2 mt-2 text-orange-500 text-xs">
                <AlertCircle size={14} />
                <span>Prochain changement dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</span>
              </div>
            )}
            <p className="text-xs text-lookup-gray mt-1">
              3-20 caracteres, lettres, chiffres et underscore
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-lookup-black dark:text-white mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 text-lookup-black dark:text-white border border-lookup-gray-light dark:border-neutral-700 focus:border-lookup-mint focus:outline-none resize-none"
              placeholder="Decris ton style en quelques mots..."
              rows={3}
              maxLength={150}
            />
            <p className="text-xs text-lookup-gray text-right mt-1">
              {bio.length}/150
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-lookup-mint-light dark:bg-neutral-800 rounded-xl">
          <p className="text-sm text-lookup-gray">
            Ta photo de profil et ta bio sont visibles par tous les utilisateurs.
            Le nom d'utilisateur ne peut etre change qu'une fois tous les 15 jours.
          </p>
        </div>
      </div>
    </div>
  )
}
