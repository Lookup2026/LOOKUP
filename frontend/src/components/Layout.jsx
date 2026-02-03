import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Plus, User, Bell, MapPin } from 'lucide-react'
import { getUnreadCount } from '../api/client'

export default function Layout() {
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await getUnreadCount()
      setUnread(res.data.count)
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

  const navItem = (to, icon, label, extra) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-col items-center py-1 transition-all duration-300 ${
          isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
        }`
      }
      {...extra}
    >
      {icon}
      <span className="text-[10px] mt-0.5 font-medium">{label}</span>
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-glass-gradient">
      <main className="pb-24">
        <Outlet context={{ refreshUnread: fetchUnread }} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 shadow-glass-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="grid grid-cols-5 items-end py-2 px-2">
          {/* Accueil */}
          <div className="flex justify-center">
            {navItem('/', <Home size={22} />, 'Accueil')}
          </div>

          {/* Notifs */}
          <div className="flex justify-center">
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex flex-col items-center py-1 transition-all duration-300 ${
                  isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
                }`
              }
              onClick={() => setUnread(0)}
            >
              <div className="relative">
                <Bell size={22} />
                {unread > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-medium">Notifs</span>
            </NavLink>
          </div>

          {/* Add Look - Center */}
          <div className="flex justify-center">
            <NavLink to="/add-look" className="relative -top-4">
              <div className="w-14 h-14 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-button transition-transform duration-300 active:scale-90">
                <Plus size={26} className="text-white" />
              </div>
            </NavLink>
          </div>

          {/* Croisements */}
          <div className="flex justify-center">
            {navItem('/crossings', <MapPin size={22} />, 'Croisements')}
          </div>

          {/* Profil */}
          <div className="flex justify-center">
            {navItem('/profile', <User size={22} />, 'Profil')}
          </div>
        </div>
      </nav>
    </div>
  )
}
