import { Outlet, NavLink } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen bg-glass-gradient">
      {/* Main content with bottom padding for nav */}
      <main className="pb-24">
        <Outlet />
      </main>

      {/* Fixed bottom navigation - Glass effect */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong rounded-t-3xl z-50 shadow-glass-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex justify-around items-center py-3 px-6">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 transition-all duration-300 ${
                isActive ? 'text-lookup-mint-dark scale-110' : 'text-lookup-gray'
              }`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Accueil</span>
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
              `flex flex-col items-center py-2 px-4 transition-all duration-300 ${
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
