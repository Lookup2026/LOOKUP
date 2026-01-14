import { create } from 'zustand'
import { sendLocationPing } from '../api/client'

export const useLocationStore = create((set, get) => ({
  isTracking: false,
  lastPing: null,
  watchId: null,
  error: null,

  // Demarrer le tracking
  startTracking: () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocalisation non supportee' })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        try {
          await sendLocationPing({ latitude, longitude, accuracy })
          set({ lastPing: new Date(), error: null })
        } catch (err) {
          console.error('Erreur ping:', err)
        }
      },
      (error) => {
        set({ error: error.message })
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 30000,
      }
    )

    set({ isTracking: true, watchId })
  },

  // Arreter le tracking
  stopTracking: () => {
    const { watchId } = get()
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
    set({ isTracking: false, watchId: null })
  },

  // Ping manuel
  sendPing: async () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords
          try {
            const { data } = await sendLocationPing({ latitude, longitude, accuracy })
            set({ lastPing: new Date() })
            resolve(data)
          } catch (err) {
            reject(err)
          }
        },
        (error) => reject(error),
        { enableHighAccuracy: true }
      )
    })
  },
}))
