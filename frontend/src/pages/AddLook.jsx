import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Plus, X, Upload, ChevronLeft, MapPin } from 'lucide-react'
import { createLook } from '../api/client'
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
  const fileInputRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

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

    if (!photo) {
      toast.error('Ajoutez une photo de votre look')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('title', title)
      formData.append('items_json', JSON.stringify(items.map(({ id, ...rest }) => rest)))

      await createLook(formData)
      toast.success('Look ajoute !')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de l\'ajout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-white pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-lookup-black" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-lookup-mint to-pink-300 rounded-full flex items-center justify-center">
            <MapPin size={12} className="text-white" />
          </div>
          <span className="text-lg font-bold text-lookup-black">LOOKUP</span>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-lookup-black px-4 mt-4 mb-6">
        Ajouter mon look
      </h1>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        {/* Photo */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-lookup-mint-light rounded-3xl aspect-[3/4] max-h-[400px] flex items-center justify-center cursor-pointer hover:bg-lookup-mint/20 transition overflow-hidden"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-lookup-mint/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera size={32} className="text-lookup-mint-dark" />
              </div>
              <p className="text-lookup-gray font-medium">Prendre une photo</p>
              <p className="text-lookup-gray text-sm mt-1">ou choisir dans la galerie</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />

        {/* Title */}
        <input
          type="text"
          placeholder="Titre du look (optionnel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-lookup-black">Pieces du look</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-lookup-mint-dark font-medium"
            >
              <Plus size={18} />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-lookup-cream rounded-2xl p-4 relative"
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
                  className="w-full bg-white rounded-xl px-4 py-3 text-lookup-black mb-3 border border-lookup-gray-light"
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
                    className="bg-white rounded-xl px-3 py-2 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray"
                  />
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={item.color}
                    onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    className="bg-white rounded-xl px-3 py-2 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={item.product_name}
                  onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                  className="w-full bg-white rounded-xl px-3 py-2 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray mt-2"
                />
                <input
                  type="text"
                  placeholder="Reference produit (optionnel)"
                  value={item.product_reference}
                  onChange={(e) =>
                    updateItem(item.id, 'product_reference', e.target.value)
                  }
                  className="w-full bg-white rounded-xl px-3 py-2 text-lookup-black text-sm border border-lookup-gray-light placeholder-lookup-gray mt-2"
                />
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <p className="text-lookup-gray text-center py-4">
              Ajoutez les pieces de votre look pour aider les autres a les trouver
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !photo}
          className="w-full flex items-center justify-center gap-2 bg-lookup-mint text-white font-semibold py-4 rounded-full shadow-button hover:bg-lookup-mint-dark transition-all disabled:opacity-50"
        >
          <Upload size={20} />
          <span>{loading ? 'Publication...' : 'Publier mon look'}</span>
        </button>
      </form>
    </div>
  )
}
