import axios from 'axios'

// En dev: proxy vers localhost:8000
// En prod: utilise VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || ''

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

// Looks
export const createLook = (formData) =>
  api.post('/looks/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getMyLooks = () => api.get('/looks/')
export const getTodayLook = () => api.get('/looks/today')
export const deleteLook = (id) => api.delete(`/looks/${id}`)
export const likeLook = (id) => api.post(`/looks/${id}/like`)
export const viewLook = (id) => api.post(`/looks/${id}/view`)
export const getLookStats = (id) => api.get(`/looks/${id}/stats`)

// Crossings
export const sendLocationPing = (data) => api.post('/crossings/ping', data)
export const getMyCrossings = () => api.get('/crossings/')
export const getCrossingDetail = (id) => api.get(`/crossings/${id}`)

export default api
