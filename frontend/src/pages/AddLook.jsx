import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Plus, X, Upload, ChevronLeft, MapPin, Save, AlertCircle } from 'lucide-react'
import { createLook, getLook, updateLook, getPhotoUrl, getLooksLimit } from '../api/client'
import toast from 'react-hot-toast'

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
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingLook, setLoadingLook] = useState(isEditing)
  const [looksLimit, setLooksLimit] = useState({ remaining: 5, max_per_day: 5, looks_today: 0 })

  // Charger le look existant si on est en mode édition
  useEffect(() => {
    if (isEditing) {
      loadExistingLook()
    } else {
      // Charger la limite de looks
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
      setPhotoPreview(getPhotoUrl(data.photo_url))
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
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
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

    if (!isEditing && !photo) {
      toast.error('Ajoutez une photo de votre look')
      return
    }

    if (!title.trim()) {
      toast.error('Donnez un nom à votre look')
      return
    }

    // Vérifier la limite (sauf en édition)
    if (!isEditing && looksLimit.remaining <= 0) {
      toast.error('Tu as atteint la limite de looks pour aujourd\'hui')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      if (photo) {
        formData.append('photo', photo)
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
        {/* Photo */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white rounded-2xl aspect-[3/4] max-h-[350px] flex items-center justify-center cursor-pointer hover:bg-lookup-cream transition overflow-hidden shadow-sm"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 bg-lookup-mint-light rounded-full mx-auto mb-3 flex items-center justify-center">
                <Camera size={28} className="text-lookup-mint" />
              </div>
              <p className="text-lookup-black font-medium">Prendre une photo</p>
              <p className="text-lookup-gray text-sm mt-1">ou choisir dans la galerie</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {/* Title */}
        <input
          type="text"
          placeholder="Nom du look (ex: Casual Friday, Soirée, Sport...)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
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
          disabled={loading || (!isEditing && !photo) || !title.trim() || (!isEditing && looksLimit.remaining <= 0)}
          className="w-full flex items-center justify-center gap-2 bg-lookup-mint text-white font-semibold py-4 rounded-full shadow-lg hover:bg-lookup-mint-dark transition-all disabled:opacity-50 mt-2"
        >
          {isEditing ? <Save size={20} /> : <Upload size={20} />}
          <span>{loading ? 'Enregistrement...' : (isEditing ? 'Enregistrer les modifications' : 'Publier mon look')}</span>
        </button>
      </form>
    </div>
  )
}
