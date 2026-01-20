import { create } from 'zustand'
import { login as apiLogin, register as apiRegister, getMe } from '../api/client'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialiser l'auth au chargement
  init: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const { data } = await getMe()
        set({ user: data, isAuthenticated: true, isLoading: false })
      } catch {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      set({ isLoading: false })
    }
  },

  // Login
  login: async (email, password) => {
    const { data } = await apiLogin({ email, password })
    localStorage.setItem('token', data.access_token)
    const { data: user } = await getMe()
    set({ user, isAuthenticated: true })
  },

  // Register
  register: async (email, username, password, fullName, referralCode = null) => {
    const registerData = { email, username, password, full_name: fullName }
    if (referralCode) {
      registerData.referral_code = referralCode
    }
    await apiRegister(registerData)
    // Login automatique apres inscription
    const { data } = await apiLogin({ email, password })
    localStorage.setItem('token', data.access_token)
    const { data: user } = await getMe()
    set({ user, isAuthenticated: true })
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },

  // Update user data
  setUser: (user) => set({ user }),
}))
