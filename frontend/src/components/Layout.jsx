import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Plus, User, Bell } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-glass-gradient">
      {/* Main content with bottom padding for nav */}
      <main className="pb-24">
        <Outlet context={{ refreshUnread: fetchUnread }} />
      </main>

      {/* Fixed bottom navigation - Glass effect */}
      <nav className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 shadow-glass-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="flex justify-around items-center py-3 px-6">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 transition-all duration-300 ${
                isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
              }`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Accueil</span>
          </NavLink>

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 transition-all duration-300 relative ${
                isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
              }`
            }
            onClick={() => setUnread(0)}
          >
            <div className="relative">
              <Bell size={24} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Notifs</span>
          </NavLink>

          {/* Add Look - Center button */}
          <NavLink
            to="/add-look"
            className="relative -top-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-button transition-transform duration-300 active:scale-90">
              <Plus size={28} className="text-white" />
            </div>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 transition-all duration-300 ${
                isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
              }`
            }
          >
            <User size={24} />
            <span className="text-xs mt-1 font-medium">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
