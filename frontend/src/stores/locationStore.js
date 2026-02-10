import { create } from 'zustand'
import { Capacitor } from '@capacitor/core'
import { sendLocationPing } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || ''

export const useLocationStore = create((set, get) => ({
  isTracking: false,
  lastPing: null,
  lastLocation: null,
  error: null,
  permissionDenied: false,

  // Demarrer le tracking en arriere-plan (appele au mount de Layout)
  startBackgroundTracking: async () => {
    if (get().isTracking) return

    // Sur plateforme native: utiliser le plugin background
    if (Capacitor.isNativePlatform()) {
      try {
        const { BackgroundGeolocation } = await import('@capgo/background-geolocation')

        await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: 'LOOKUP detecte les croisements en arriere-plan.',
            backgroundTitle: 'LOOKUP est actif',
            requestPermissions: true,
            stale: false,
            distanceFilter: 30,
          },
          async (location, error) => {
            if (error) {
              if (error.code === 'NOT_AUTHORIZED') {
                set({ permissionDenied: true, error: 'Permission refusee' })
              }
              console.error('Background location error:', error)
              return
            }

            if (!location) return

            set({ lastLocation: location })

            // Envoyer le ping au backend via fetch (fiable en background)
            try {
              const token = localStorage.getItem('token')
              if (!token) return

              const response = await fetch(`${API_URL}/api/crossings/ping`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  latitude: location.latitude,
                  longitude: location.longitude,
                  accuracy: location.accuracy,
                }),
              })

              if (response.ok) {
                set({ lastPing: new Date(), error: null })
              }
            } catch (err) {
              console.error('Background ping failed:', err)
            }
          }
        )

        set({ isTracking: true, error: null, permissionDenied: false })
      } catch (err) {
        console.error('Failed to start background tracking:', err)
        set({ error: err.message || 'Erreur demarrage tracking' })
      }
      return
    }

    // Fallback web: utiliser navigator.geolocation
    if (!navigator.geolocation) {
      set({ error: 'Geolocalisation non supportee' })
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        set({ lastLocation: { latitude, longitude, accuracy } })
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

    set({ isTracking: true, _browserWatchId: watchId })
  },

  // Arreter le tracking (appele au logout)
  stopBackgroundTracking: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { BackgroundGeolocation } = await import('@capgo/background-geolocation')
        await BackgroundGeolocation.removeWatcher({ id: undefined })
      } catch (err) {
        console.error('Failed to stop background tracking:', err)
      }
    } else {
      const watchId = get()._browserWatchId
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
    set({ isTracking: false, _browserWatchId: null })
  },

  // Ouvrir les reglages de localisation (si permission refusee)
  openLocationSettings: async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { BackgroundGeolocation } = await import('@capgo/background-geolocation')
        await BackgroundGeolocation.openSettings()
      } catch (err) {
        console.error('Failed to open settings:', err)
      }
    }
  },

  // Ping manuel (pull-to-refresh, foreground)
  sendPing: async () => {
    const { lastLocation } = get()

    // Utiliser la derniere position connue si disponible
    if (lastLocation) {
      const { data } = await sendLocationPing({
        latitude: lastLocation.latitude,
        longitude: lastLocation.longitude,
        accuracy: lastLocation.accuracy,
      })
      set({ lastPing: new Date() })
      return data
    }

    // Sinon, demander une nouvelle position
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
      })
    })
    const { latitude, longitude, accuracy } = position.coords
    const { data } = await sendLocationPing({ latitude, longitude, accuracy })
    set({ lastPing: new Date() })
    return data
  },
}))
