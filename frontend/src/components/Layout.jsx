import { Outlet, NavLink } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'

export default function Layout() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main content */}
      <main className="flex-1 overflow-auto safe-area-top">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-lookup-gray-light safe-area-bottom">
        <div className="flex justify-around items-center py-3 px-6">
          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center transition-colors ${
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
            className="relative -top-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-lookup-mint to-lookup-mint-dark rounded-full flex items-center justify-center shadow-lg">
              <Plus size={28} className="text-white" />
            </div>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center transition-colors ${
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
