import axios from 'axios'

// En dev: proxy vers localhost:8000
// En prod: utilise VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || ''

// Helper pour construire l'URL complete des photos
export const getPhotoUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gerer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')
export const uploadAvatar = (formData) =>
  api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteAccount = () => api.delete('/auth/account')

// Looks
export const createLook = (formData) =>
  api.post('/looks/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getMyLooks = () => api.get('/looks/')
export const getTodayLook = () => api.get('/looks/today')
export const getLook = (id) => api.get(`/looks/${id}`)
export const updateLook = (id, formData) =>
  api.put(`/looks/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteLook = (id) => api.delete(`/looks/${id}`)
export const likeLook = (id) => api.post(`/looks/${id}/like`)
export const viewLook = (id) => api.post(`/looks/${id}/view`)
export const getLookStats = (id) => api.get(`/looks/${id}/stats`)
export const saveLook = (id) => api.post(`/looks/${id}/save`)
export const getSavedLooks = () => api.get('/looks/saved/list')

// Crossings
export const sendLocationPing = (data) => api.post('/crossings/ping', data)
export const getMyCrossings = () => api.get('/crossings/')
export const getCrossingDetail = (id) => api.get(`/crossings/${id}`)

// Users
export const blockUser = (id) => api.post(`/users/${id}/block`)
export const getBlockedUsers = () => api.get('/users/blocked')
export const checkIfBlocked = (id) => api.get(`/users/${id}/is-blocked`)
export const reportContent = (data) => api.post('/users/report', null, { params: data })

export default api
