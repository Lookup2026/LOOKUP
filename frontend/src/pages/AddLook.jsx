import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Plus, X, Upload, ChevronLeft, MapPin, Save, AlertCircle, Image } from 'lucide-react'
import { createLook, getLook, updateLook, getPhotoUrl, getLooksLimit } from '../api/client'
import toast from 'react-hot-toast'

const MAX_PHOTOS = 5

const CATEGORIES = [
  { id: 'top', label: 'Haut' },
  { id: 'bottom', label: 'Bas' },
  { id: 'shoes', label: 'Chaussures' },
  { id: 'outerwear', label: 'Veste/Manteau' },
  { id: 'accessory', label: 'Accessoire' },
]

export default function AddLook() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const fileInputRef = useRef(null)

  // Multi-photo state
  // newPhotos: fichiers File a uploader
  // existingPhotos: photos deja en DB (en edition) [{id, photo_url}]
  const [newPhotos, setNewPhotos] = useState([]) // [{file, preview}]
  const [existingPhotos, setExistingPhotos] = useState([]) // [{id, photo_url}]
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([])

  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingLook, setLoadingLook] = useState(isEditing)
  const [looksLimit, setLooksLimit] = useState({ remaining: 5, max_per_day: 5, looks_today: 0 })

  const totalPhotos = existingPhotos.length + newPhotos.length
  const canAddMore = totalPhotos < MAX_PHOTOS

  useEffect(() => {
    if (isEditing) {
      loadExistingLook()
    } else {
      loadLooksLimit()
    }
  }, [id])

  const loadLooksLimit = async () => {
    try {
      const { data } = await getLooksLimit()
      setLooksLimit(data)
    } catch (error) {
      console.error('Erreur chargement limite:', error)
    }
  }

  const loadExistingLook = async () => {
    try {
      const { data } = await getLook(id)
      setTitle(data.title || '')

      // Charger les photos existantes
      if (data.photo_urls && data.photo_urls.length > 0) {
        // On a besoin des IDs des LookPhoto pour pouvoir les supprimer
        // Pour l'instant on utilise l'index comme pseudo-id, le backend gere via existing_photos_json
        setExistingPhotos(data.photo_urls.map((url, index) => ({
          id: index, // sera remplace par le vrai id si dispo
          photo_url: url,
        })))
      } else if (data.photo_url) {
        setExistingPhotos([{ id: 0, photo_url: data.photo_url }])
      }

      if (data.items && data.items.length > 0) {
        setItems(data.items.map((item, index) => ({
          id: item.id || `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          category: item.category,
          brand: item.brand || '',
          product_name: item.product_name || '',
          product_reference: item.product_reference || '',
          color: item.color || '',
        })))
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du look')
      navigate('/profile')
    } finally {
      setLoadingLook(false)
    }
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = MAX_PHOTOS - totalPhotos
    const toAdd = files.slice(0, remaining)

    if (files.length > remaining) {
      toast.error(`Maximum ${MAX_PHOTOS} photos. ${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`)
    }

    const newEntries = toAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))

    setNewPhotos(prev => [...prev, ...newEntries])
    // Reset input pour pouvoir re-selectionner les memes fichiers
    e.target.value = ''
  }

  const removeNewPhoto = (index) => {
    setNewPhotos(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const removeExistingPhoto = (index) => {
    const photo = existingPhotos[index]
    setDeletedPhotoIds(prev => [...prev, photo.id])
    setExistingPhotos(prev => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        category: 'top',
        brand: '',
        product_name: '',
        product_reference: '',
        color: '',
      },
    ])
  }

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const hasPhotos = isEditing ? (existingPhotos.length + newPhotos.length) > 0 : newPhotos.length > 0
    if (!hasPhotos) {
      toast.error('Ajoutez au moins une photo de votre look')
      return
    }

    if (!isEditing && looksLimit.remaining <= 0) {
      toast.error('Tu as atteint la limite de looks pour aujourd\'hui')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      if (isEditing) {
        // Ajouter nouvelles photos
        for (const entry of newPhotos) {
          formData.append('photos', entry.file)
        }
        // Photos a supprimer
        if (deletedPhotoIds.length > 0) {
          formData.append('delete_photo_ids_json', JSON.stringify(deletedPhotoIds))
        }
        // Ordre des photos existantes
        formData.append('existing_photos_json', JSON.stringify(existingPhotos.map(p => p.id)))
      } else {
        // Creation: toutes les photos sont nouvelles
        for (const entry of newPhotos) {
          formData.append('photos', entry.file)
        }
      }

      formData.append('title', title)
      formData.append('items_json', JSON.stringify(items.map(({ id, ...rest }) => rest)))

      if (isEditing) {
        await updateLook(id, formData)
        toast.success('Look modifié !')
      } else {
        await createLook(formData)
        toast.success('Look ajouté !')
      }
      navigate('/profile')
    } catch (error) {
      console.error('Erreur publication look:', error, error.response?.status, error.response?.data)
      const msg = error.response?.data?.detail || error.message || 'Erreur inconnue'
      toast.error(`Erreur: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingLook) {
    return (
      <div className="min-h-full bg-lookup-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-lookup-mint border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3">
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

      {/* Title */}
      <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide px-4 pt-4 mb-3">
        {isEditing ? 'Modifier mon look' : 'Ajouter mon look du jour'}
      </h2>

      {/* Limite de looks - seulement en mode création */}
      {!isEditing && (
        <div className="px-4">
          {looksLimit.remaining > 0 ? (
            <div className="bg-lookup-mint-light rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-lookup-mint rounded-full flex items-center justify-center text-white font-bold">
                {looksLimit.remaining}
              </div>
              <div>
                <p className="text-lookup-black font-medium text-sm">
                  {looksLimit.remaining} look{looksLimit.remaining > 1 ? 's' : ''} restant{looksLimit.remaining > 1 ? 's' : ''} aujourd'hui
                </p>
                <p className="text-lookup-gray text-xs">
                  {looksLimit.looks_today}/{looksLimit.max_per_day} utilisés
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-red-600 font-medium text-sm">
                  Limite atteinte pour aujourd'hui
                </p>
                <p className="text-red-400 text-xs">
                  Tu as déjà posté {looksLimit.max_per_day} looks. Reviens demain !
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        {/* Photos - Multi picker */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Image size={16} className="text-lookup-gray" />
              <span className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">
                Photos ({totalPhotos}/{MAX_PHOTOS})
              </span>
            </div>
          </div>

          {/* Zone d'ajout grande si aucune photo */}
          {totalPhotos === 0 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-white rounded-2xl aspect-[3/4] max-h-[350px] flex items-center justify-center cursor-pointer hover:bg-lookup-cream transition overflow-hidden shadow-sm border-2 border-dashed border-lookup-gray-light"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-lookup-mint-light rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Camera size={28} className="text-lookup-mint" />
                </div>
                <p className="text-lookup-black font-medium">Prendre une photo</p>
                <p className="text-lookup-gray text-sm mt-1">ou choisir dans la galerie (jusqu'à 5)</p>
              </div>
            </div>
          )}

          {/* Bande horizontale de miniatures quand il y a des photos */}
          {totalPhotos > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Existing photos */}
              {existingPhotos.map((photo, index) => (
                <div key={`existing-${index}`} className="relative flex-shrink-0">
                  <img
                    src={getPhotoUrl(photo.photo_url)}
                    alt={`Photo ${index + 1}`}
                    className="w-28 h-36 object-cover rounded-xl shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X size={14} />
                  </button>
                  {index === 0 && existingPhotos.length + newPhotos.length > 1 && (
                    <div className="absolute bottom-1.5 left-1.5 bg-lookup-mint text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      Principal
                    </div>
                  )}
                </div>
              ))}

              {/* New photos */}
              {newPhotos.map((entry, index) => (
                <div key={`new-${index}`} className="relative flex-shrink-0">
                  <img
                    src={entry.preview}
                    alt={`Nouvelle photo ${index + 1}`}
                    className="w-28 h-36 object-cover rounded-xl shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X size={14} />
                  </button>
                  {existingPhotos.length === 0 && index === 0 && newPhotos.length > 1 && (
                    <div className="absolute bottom-1.5 left-1.5 bg-lookup-mint text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      Principal
                    </div>
                  )}
                </div>
              ))}

              {/* Bouton + Ajouter */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-shrink-0 w-28 h-36 bg-white rounded-xl border-2 border-dashed border-lookup-mint/40 flex flex-col items-center justify-center gap-2 hover:bg-lookup-mint-light transition active:scale-95"
                >
                  <div className="w-10 h-10 bg-lookup-mint-light rounded-full flex items-center justify-center">
                    <Plus size={22} className="text-lookup-mint" />
                  </div>
                  <span className="text-xs font-medium text-lookup-mint">Ajouter</span>
                </button>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="hidden"
        />

        {/* Title */}
        <input
          type="text"
          placeholder="Nom du look (ex: Casual Friday, Soirée, Sport...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-white rounded-xl px-4 py-3 text-lookup-black border border-lookup-gray-light placeholder-lookup-gray shadow-sm"
        />

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-lookup-gray uppercase tracking-wide">Pièces du look</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-lookup-mint font-medium text-sm"
            >
              <Plus size={16} />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 relative shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 text-lookup-gray hover:text-red-500"
                >
                  <X size={18} />
                </button>

                <select
                  value={item.category}
                  onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                  className="w-full bg-lookup-cream rounded-xl px-4 py-3 text-lookup-black mb-3 border border-lookup-gray-light text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Marque"
                    value={item.brand}
                    onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                    className="bg-lookup-cream rounded-xl px-3 py-2.5 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray"
                  />
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={item.color}
                    onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    className="bg-lookup-cream rounded-xl px-3 py-2.5 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={item.product_name}
                  onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                  className="w-full bg-lookup-cream rounded-xl px-3 py-2.5 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray mt-2"
                />
                <input
                  type="text"
                  placeholder="Référence produit (optionnel)"
                  value={item.product_reference}
                  onChange={(e) =>
                    updateItem(item.id, 'product_reference', e.target.value)
                  }
                  className="w-full bg-lookup-cream rounded-xl px-3 py-2.5 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray mt-2"
                />
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-lookup-gray text-sm">
                Ajoutez les pièces de votre look pour aider les autres à les trouver
              </p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || (!isEditing && newPhotos.length === 0) || (!isEditing && looksLimit.remaining <= 0)}
          className="w-full flex items-center justify-center gap-2 bg-lookup-mint text-white font-semibold py-4 rounded-full shadow-lg hover:bg-lookup-mint-dark transition-all disabled:opacity-50 mt-2"
        >
          {isEditing ? <Save size={20} /> : <Upload size={20} />}
          <span>{loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer les modifications' : 'Publier mon look')}</span>
        </button>
      </form>
    </div>
  )
}
