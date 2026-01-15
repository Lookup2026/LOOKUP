import { Outlet, NavLink } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen bg-lookup-cream">
      {/* Main content with bottom padding for nav */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-lookup-gray-light z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex justify-around items-center py-2 px-6">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? 'text-lookup-mint-dark' : 'text-lookup-gray'
              }`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1">Accueil</span>
          </NavLink>

          {/* Add Look - Center button */}
          <NavLink
            to="/add-look"
            className="relative -top-5"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-lg">
              <Plus size={28} className="text-white" />
            </div>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-4 transition-colors ${
                isActive ? 'text-lookup-mint-dark' : 'text-lookup-gray'
              }`
            }
          >
            <User size={24} />
            <span className="text-xs mt-1">Profil</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
