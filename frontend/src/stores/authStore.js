import { create } from 'zustand'
import { login as apiLogin, register as apiRegister, getMe, logout as apiLogout } from '../api/client'
import { useLocationStore } from './locationStore'

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
      // Tenter avec le cookie httpOnly (pas de token en localStorage)
      try {
        const { data } = await getMe()
        set({ user: data, isAuthenticated: true, isLoading: false })
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    }
  },

  // Login — stocke le token ET le backend set un cookie httpOnly
  login: async (email, password) => {
    const { data } = await apiLogin({ email, password })
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
    }
    try {
      const { data: user } = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
      throw new Error('Erreur lors de la récupération du profil')
    }
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
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
    }
    try {
      const { data: user } = await getMe()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
      throw new Error('Erreur lors de la récupération du profil')
    }
  },

  // Logout — supprime le cookie httpOnly + localStorage + arrete le tracking
  logout: async () => {
    // Arreter le tracking en arriere-plan
    await useLocationStore.getState().stopBackgroundTracking()
    try {
      await apiLogout()
    } catch {
      // Ignore si le serveur est down
    }
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },

  // Update user data
  setUser: (user) => set({ user }),
}))
