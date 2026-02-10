import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Plus, X, Upload, ChevronLeft, MapPin, Save, AlertCircle, Image, Navigation, Trash2 } from 'lucide-react'
import { createLook, getLook, updateLook, getPhotoUrl, getLooksLimit } from '../api/client'
import { useLocationStore } from '../stores/locationStore'
import { compressImage } from '../utils/imageCompression'
import toast from 'react-hot-toast'

const MAX_PHOTOS = 5

const CATEGORIES = [
  { id: 'top', label: 'Haut' },
  { id: 'bottom', label: 'Bas' },
  { id: 'shoes', label: 'Chaussures' },
  { id: 'outerwear', label: 'Veste/Manteau' },
  { id: 'accessory', label: 'Accessoire' },
]

// Marques populaires
const POPULAR_BRANDS = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo', 'Levi\'s', 'The North Face',
  'Gucci', 'Louis Vuitton', 'Prada', 'Balenciaga', 'Off-White', 'Supreme',
  'Carhartt', 'Stussy', 'Patagonia', 'New Balance', 'Converse', 'Vans',
  'Ralph Lauren', 'Tommy Hilfiger', 'Calvin Klein', 'Lacoste', 'Hugo Boss',
  'Diesel', 'G-Star', 'Acne Studios', 'A.P.C.', 'Ami Paris', 'Sandro',
  'Maje', 'The Kooples', 'Zadig & Voltaire', 'Isabel Marant', 'Ba&sh',
  'Cos', '& Other Stories', 'Arket', 'Massimo Dutti', 'Mango',
  'Pull & Bear', 'Bershka', 'Stradivarius', 'Asos', 'Boohoo',
  'Jordan', 'Yeezy', 'Fear of God', 'Essentials', 'Stone Island',
  'Moncler', 'Canada Goose', 'Arc\'teryx', 'Salomon', 'Hoka',
  'Asics', 'Puma', 'Reebok', 'Fila', 'Champion', 'Dickies',
  'Wrangler', 'Lee', 'Edwin', 'Nudie Jeans', 'Naked & Famous',
  'Dr. Martens', 'Timberland', 'Clarks', 'Birkenstock', 'Crocs',
  'Hermès', 'Chanel', 'Dior', 'Saint Laurent', 'Bottega Veneta',
  'Celine', 'Loewe', 'Valentino', 'Versace', 'Fendi', 'Burberry',
  'Jacquemus', 'Lemaire', 'Maison Margiela', 'Rick Owens', 'Vetements'
].sort()

// Récupérer les marques utilisées depuis localStorage
const getUserBrands = () => {
  try {
    return JSON.parse(localStorage.getItem('lookup_user_brands') || '[]')
  } catch {
    return []
  }
}

// Sauvegarder une marque utilisée
const saveUserBrand = (brand) => {
  if (!brand || brand.length < 2) return
  const brands = getUserBrands()
  if (!brands.includes(brand)) {
    const updated = [brand, ...brands].slice(0, 20) // Garder max 20 marques
    localStorage.setItem('lookup_user_brands', JSON.stringify(updated))
  }
}

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

  // Location state
  const [location, setLocation] = useState({ latitude: null, longitude: null, city: null, country: null })
  const [loadingLocation, setLoadingLocation] = useState(false)
  const { lastPosition } = useLocationStore()

  // Brand autocomplete state
  const [activeBrandInput, setActiveBrandInput] = useState(null) // item.id du champ actif
  const [brandSuggestions, setBrandSuggestions] = useState([])
  const [userBrands, setUserBrands] = useState(getUserBrands())

  // Swipe state
  const [swipingItemId, setSwipingItemId] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const touchStartX = useRef(0)

  const totalPhotos = existingPhotos.length + newPhotos.length
  const canAddMore = totalPhotos < MAX_PHOTOS

  useEffect(() => {
    if (isEditing) {
      loadExistingLook()
    } else {
      loadLooksLimit()
      fetchLocation()
    }
  }, [id])

  // Récupérer la localisation et faire le reverse geocoding
  const fetchLocation = async () => {
    setLoadingLocation(true)
    try {
      // Utiliser la position du store ou demander une nouvelle
      let lat, lng
      if (lastPosition?.latitude && lastPosition?.longitude) {
        lat = lastPosition.latitude
        lng = lastPosition.longitude
      } else if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      }

      if (lat && lng) {
        setLocation(prev => ({ ...prev, latitude: lat, longitude: lng }))

        // Reverse geocoding avec Nominatim (OpenStreetMap)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
          )
          const data = await response.json()
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.municipality
            const country = data.address.country
            setLocation(prev => ({ ...prev, city, country }))
          }
        } catch (e) {
          console.log('Reverse geocoding failed:', e)
        }
      }
    } catch (e) {
      console.log('Location error:', e)
    } finally {
      setLoadingLocation(false)
    }
  }

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
          photo: null,
          photoPreview: null,
          existingPhotoUrl: item.photo_url || null,
        })))
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du look')
      navigate('/profile')
    } finally {
      setLoadingLook(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remaining = MAX_PHOTOS - totalPhotos
    const toAdd = files.slice(0, remaining)

    if (files.length > remaining) {
      toast.error(`Maximum ${MAX_PHOTOS} photos. ${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`)
    }

    // Compresser les images avant de les ajouter
    const compressedEntries = await Promise.all(
      toAdd.map(async (file) => {
        const compressedFile = await compressImage(file)
        return {
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
        }
      })
    )

    setNewPhotos(prev => [...prev, ...compressedEntries])
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
        photo: null,
        photoPreview: null,
        existingPhotoUrl: null,
      },
    ])
  }

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeItem = (id) => {
    const item = items.find(i => i.id === id)
    if (item?.photoPreview) URL.revokeObjectURL(item.photoPreview)
    setItems(items.filter((item) => item.id !== id))
    setSwipingItemId(null)
    setSwipeOffset(0)
  }

  const handleItemPhoto = async (itemId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    const preview = URL.createObjectURL(compressed)
    setItems(items.map(item => item.id === itemId ? {
      ...item,
      photo: compressed,
      photoPreview: preview,
      existingPhotoUrl: null,
    } : item))
  }

  const removeItemPhoto = (itemId) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item
      if (item.photoPreview) URL.revokeObjectURL(item.photoPreview)
      return { ...item, photo: null, photoPreview: null, existingPhotoUrl: null }
    }))
  }

  // Recherche de marques
  const searchBrands = (query, itemId) => {
    if (!query || query.length < 1) {
      setBrandSuggestions([])
      setActiveBrandInput(null)
      return
    }

    setActiveBrandInput(itemId)
    const q = query.toLowerCase()

    // Marques de l'utilisateur en premier
    const userMatches = userBrands.filter(b => b.toLowerCase().includes(q))
    // Puis marques populaires
    const popularMatches = POPULAR_BRANDS.filter(b =>
      b.toLowerCase().includes(q) && !userMatches.includes(b)
    )

    setBrandSuggestions([...userMatches.slice(0, 3), ...popularMatches.slice(0, 5)])
  }

  const selectBrand = (itemId, brand) => {
    updateItem(itemId, 'brand', brand)
    setBrandSuggestions([])
    setActiveBrandInput(null)
    saveUserBrand(brand)
    setUserBrands(getUserBrands())
  }

  // Swipe handlers
  const handleTouchStart = (e, itemId) => {
    touchStartX.current = e.touches[0].clientX
    setSwipingItemId(itemId)
  }

  const handleTouchMove = (e, itemId) => {
    if (swipingItemId !== itemId) return
    const diff = touchStartX.current - e.touches[0].clientX
    // Seulement vers la gauche, max 100px
    const offset = Math.min(Math.max(diff, 0), 100)
    setSwipeOffset(offset)
  }

  const handleTouchEnd = (itemId) => {
    if (swipeOffset > 60) {
      // Swipe assez long → supprimer
      removeItem(itemId)
    } else {
      // Reset
      setSwipeOffset(0)
      setSwipingItemId(null)
    }
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

      // Collecter les photos d'items et construire items_json avec _photo_index
      let itemPhotoIndex = 0
      const itemsForJson = items.map(({ id, photo, photoPreview, existingPhotoUrl, ...rest }) => {
        const itemData = { ...rest }
        if (photo) {
          formData.append('item_photos', photo)
          itemData._photo_index = itemPhotoIndex
          itemPhotoIndex++
        } else if (existingPhotoUrl) {
          itemData.photo_url = existingPhotoUrl
        }
        return itemData
      })
      formData.append('items_json', JSON.stringify(itemsForJson))

      // Ajouter la localisation si disponible (uniquement à la création)
      if (!isEditing && location.latitude && location.longitude) {
        formData.append('latitude', location.latitude)
        formData.append('longitude', location.longitude)
        if (location.city) formData.append('city', location.city)
        if (location.country) formData.append('country', location.country)
      }

      if (isEditing) {
        await updateLook(id, formData)
        toast.success('Look modifié !')
      } else {
        await createLook(formData)
        toast.success('Look ajouté !')
      }

      // Sauvegarder les marques utilisées
      items.forEach(item => {
        if (item.brand) saveUserBrand(item.brand)
      })

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
      <div className="bg-white px-4 pb-3 sticky top-0 z-20" style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))' }}>
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

        {/* Location indicator */}
        {!isEditing && (
          <div className="flex items-center gap-2 px-1">
            <Navigation size={14} className={loadingLocation ? 'text-lookup-gray animate-pulse' : 'text-lookup-mint'} />
            {loadingLocation ? (
              <span className="text-xs text-lookup-gray">Détection de la position...</span>
            ) : location.city ? (
              <span className="text-xs text-lookup-gray">
                📍 {location.city}{location.country ? `, ${location.country}` : ''}
              </span>
            ) : location.latitude ? (
              <span className="text-xs text-lookup-gray">📍 Position détectée</span>
            ) : (
              <span className="text-xs text-lookup-gray">Position non disponible</span>
            )}
          </div>
        )}

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
            {items.map((item) => {
              const category = CATEGORIES.find(c => c.id === item.category)
              const isSwipingThis = swipingItemId === item.id

              return (
                <div key={item.id} className="relative overflow-hidden rounded-2xl">
                  {/* Delete background (revealed on swipe) */}
                  <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center rounded-r-2xl">
                    <Trash2 size={24} className="text-white" />
                  </div>

                  {/* Swipeable card */}
                  <div
                    className="bg-white rounded-2xl p-4 relative shadow-sm transition-transform"
                    style={{
                      transform: isSwipingThis ? `translateX(-${swipeOffset}px)` : 'translateX(0)',
                      transition: isSwipingThis ? 'none' : 'transform 0.2s ease-out'
                    }}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={(e) => handleTouchMove(e, item.id)}
                    onTouchEnd={() => handleTouchEnd(item.id)}
                  >
                    {/* Photo de la piece */}
                    <div className="mb-3">
                      {(item.photoPreview || item.existingPhotoUrl) ? (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={item.photoPreview || getPhotoUrl(item.existingPhotoUrl)}
                              alt="Photo piece"
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeItemPhoto(item.id)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                            >
                              <X size={10} />
                            </button>
                          </div>
                          <span className="text-xs text-lookup-gray">Photo de la piece</span>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer text-lookup-mint text-sm font-medium">
                          <div className="w-10 h-10 bg-lookup-mint-light rounded-xl flex items-center justify-center">
                            <Camera size={18} className="text-lookup-mint" />
                          </div>
                          <span>Ajouter une photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleItemPhoto(item.id, e)}
                          />
                        </label>
                      )}
                    </div>

                    {/* Category selector with icon */}
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
                      {/* Brand input with autocomplete */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Marque"
                          value={item.brand}
                          onChange={(e) => {
                            updateItem(item.id, 'brand', e.target.value)
                            searchBrands(e.target.value, item.id)
                          }}
                          onFocus={() => searchBrands(item.brand, item.id)}
                          onBlur={() => setTimeout(() => {
                            if (activeBrandInput === item.id) {
                              setBrandSuggestions([])
                              setActiveBrandInput(null)
                            }
                          }, 200)}
                          className="w-full bg-lookup-cream rounded-xl px-3 py-2.5 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray"
                        />
                        {/* Suggestions dropdown */}
                        {activeBrandInput === item.id && brandSuggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 max-h-40 overflow-y-auto">
                            {brandSuggestions.map((brand, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => selectBrand(item.id, brand)}
                                className="w-full text-left px-3 py-2 text-sm text-lookup-black hover:bg-lookup-cream transition flex items-center gap-2"
                              >
                                {userBrands.includes(brand) && (
                                  <span className="text-xs text-lookup-mint">★</span>
                                )}
                                {brand}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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

                    {/* Swipe hint */}
                    <p className="text-xs text-lookup-gray/50 text-center mt-2">← Glisser pour supprimer</p>
                  </div>
                </div>
              )
            })}
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
