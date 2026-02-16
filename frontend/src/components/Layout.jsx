import { useState, useEffect, useCallback, useRef } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Plus, User, Bell, Compass } from 'lucide-react'
import { getUnreadCount } from '../api/client'
import { useLocationStore } from '../stores/locationStore'

export default function Layout() {
  const [unread, setUnread] = useState(0)
  const [badgeBounce, setBadgeBounce] = useState(false)
  const [lightIcons, setLightIcons] = useState(false)
  const [fabPressed, setFabPressed] = useState(false)
  const { startBackgroundTracking, isTracking } = useLocationStore()
  const navRef = useRef(null)
  const location = useLocation()
  const prevUnreadRef = useRef(0)

  const DEMO_MODE = false

  const fetchUnread = useCallback(async () => {
    if (DEMO_MODE) {
      setUnread(3)
      return
    }
    try {
      const res = await getUnreadCount()
      const newCount = res.data.count
      if (newCount > prevUnreadRef.current) {
        setBadgeBounce(true)
        setTimeout(() => setBadgeBounce(false), 400)
      }
      prevUnreadRef.current = newCount
      setUnread(newCount)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    const onFocus = () => fetchUnread()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchUnread])

  // Demarrer le tracking en arriere-plan (pas en demo)
  useEffect(() => {
    if (!DEMO_MODE && !isTracking) {
      startBackgroundTracking()
    }
  }, [])

  // Detecter si le fond derriere la navbar est sombre
  useEffect(() => {
    let ticking = false

    const checkBackground = () => {
      if (!navRef.current) return
      const navRect = navRef.current.getBoundingClientRect()

      // Verifier plusieurs points pour plus de fiabilite
      const points = [
        { x: navRect.left + navRect.width * 0.25, y: navRect.top + 10 },
        { x: navRect.left + navRect.width * 0.5, y: navRect.top + 10 },
        { x: navRect.left + navRect.width * 0.75, y: navRect.top + 10 },
      ]

      // Cacher temporairement la nav pour voir ce qu'il y a derriere
      navRef.current.style.pointerEvents = 'none'
      navRef.current.style.visibility = 'hidden'

      let darkCount = 0

      points.forEach(({ x, y }) => {
        const el = document.elementFromPoint(x, y)
        if (!el) return

        // Verifier si c'est une image ou video
        const isMedia = el.tagName === 'IMG' || el.tagName === 'VIDEO' ||
                        el.closest('.photo-carousel') ||
                        el.closest('[class*="aspect-"]') ||
                        el.closest('.swiper-slide')

        // Verifier si c'est un element sombre
        const hasDarkClass = el.closest('[class*="bg-black"]') ||
                             el.closest('[class*="bg-gray-9"]') ||
                             el.closest('[class*="bg-neutral-9"]') ||
                             el.closest('.dark')

        if (isMedia || hasDarkClass) {
          darkCount++
        } else {
          // Verifier la couleur de fond
          const bg = window.getComputedStyle(el).backgroundColor
          const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
          if (match) {
            const r = parseInt(match[1])
            const g = parseInt(match[2])
            const b = parseInt(match[3])
            const brightness = (r * 299 + g * 587 + b * 114) / 1000
            if (brightness < 128) darkCount++
          }
        }
      })

      navRef.current.style.visibility = 'visible'
      navRef.current.style.pointerEvents = 'auto'

      // Si au moins 2 points sur 3 sont sombres, utiliser les icones claires
      setLightIcons(darkCount >= 2)
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkBackground()
          ticking = false
        })
        ticking = true
      }
    }

    // Ecouter scroll et aussi les changements de DOM
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', checkBackground)

    // Check initial et apres chargement des images
    setTimeout(checkBackground, 100)
    setTimeout(checkBackground, 500)
    setTimeout(checkBackground, 1000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', checkBackground)
    }
  }, [location.pathname]) // Re-check quand on change de page

  // Couleurs adaptatives selon le fond
  const iconColor = lightIcons ? 'text-white' : 'text-gray-700'
  const iconColorActive = lightIcons ? 'text-white bg-white/20' : 'text-gray-900 bg-black/10'

  // Fond de la navbar adaptatif
  const navBackground = lightIcons
    ? 'rgba(0,0,0,0.3)' // Fond sombre sur images/fonds sombres
    : 'rgba(255,255,255,0.85)' // Fond clair opaque sur fonds clairs

  const navItem = (to, icon, extra) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
          isActive ? iconColorActive : iconColor
        }`
      }
      {...extra}
    >
      {icon}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-glass-gradient">
      <main className="pb-20">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet context={{ refreshUnread: fetchUnread }} />
        </div>
      </main>

      {/* FAB bouton + flottant */}
      <NavLink
        to="/add-look"
        className="fixed z-50 right-5"
        style={{ bottom: '85px' }}
        onClick={() => {
          setFabPressed(true)
          setTimeout(() => setFabPressed(false), 300)
        }}
      >
        <div className={`w-14 h-14 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 active:scale-90 ${fabPressed ? 'animate-fab-press' : ''}`}>
          <Plus size={26} className="text-black dark:text-white" />
        </div>
      </NavLink>

      {/* Navbar flottante bulle */}
      <nav ref={navRef} className="fixed bottom-0 left-0 right-0 z-50 px-4" style={{ paddingBottom: '12px' }}>
        <div
          className="flex items-center justify-around py-3 rounded-[28px] transition-all duration-300"
          style={{
            background: navBackground,
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
            backdropFilter: 'blur(16px) saturate(150%)',
            boxShadow: lightIcons ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {navItem('/', <Home size={22} />)}

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive ? iconColorActive : iconColor
              }`
            }
            onClick={() => setUnread(0)}
          >
            <div className="relative">
              <Bell size={22} />
              {unread > 0 && (
                <span className={`absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 ${badgeBounce ? 'animate-badge-bounce' : ''}`}>
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
          </NavLink>

          {navItem('/discover', <Compass size={22} />)}

          {navItem('/profile', <User size={22} />)}
        </div>
      </nav>
    </div>
  )
}
