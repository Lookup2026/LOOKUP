import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Plus, X, Upload } from 'lucide-react'
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
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Ajouter mon look</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-lookup-gray rounded-xl aspect-[3/4] flex items-center justify-center cursor-pointer hover:bg-lookup-light-gray transition overflow-hidden"
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Camera size={48} className="text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Prendre une photo</p>
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
          className="w-full bg-lookup-gray border border-lookup-light-gray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lookup-accent"
        />

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-white">Pieces</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-lookup-accent"
            >
              <Plus size={18} />
              <span>Ajouter</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-lookup-gray rounded-xl p-4 relative"
              >
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>

                <select
                  value={item.category}
                  onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                  className="w-full bg-lookup-light-gray rounded-lg px-4 py-2 text-white mb-3"
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
                    className="bg-lookup-light-gray rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Couleur"
                    value={item.color}
                    onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    className="bg-lookup-light-gray rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={item.product_name}
                  onChange={(e) => updateItem(item.id, 'product_name', e.target.value)}
                  className="w-full bg-lookup-light-gray rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 mt-2"
                />
                <input
                  type="text"
                  placeholder="Reference produit (optionnel)"
                  value={item.product_reference}
                  onChange={(e) =>
                    updateItem(item.id, 'product_reference', e.target.value)
                  }
                  className="w-full bg-lookup-light-gray rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 mt-2"
                />
              </div>
            ))}
          </div>

          {items.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              Ajoutez les pieces de votre look pour aider les autres a les trouver
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !photo}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          <Upload size={20} />
          <span>{loading ? 'Publication...' : 'Publier mon look'}</span>
        </button>
      </form>
    </div>
  )
}
