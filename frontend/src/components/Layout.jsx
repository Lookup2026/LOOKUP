import { Outlet, NavLink } from 'react-router-dom'
import { Home, PlusCircle, Users, User } from 'lucide-react'

export default function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/add-look', icon: PlusCircle, label: 'Look' },
    { to: '/crossings', icon: Users, label: 'Croises' },
    { to: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto safe-area-top">
        <Outlet />
      </main>

      {/* Navigation bottom */}
      <nav className="bg-lookup-dark border-t border-lookup-gray safe-area-bottom">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 transition-colors ${
                  isActive ? 'text-lookup-accent' : 'text-gray-400'
                }`
              }
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
