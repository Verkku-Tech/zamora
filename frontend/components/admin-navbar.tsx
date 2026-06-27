'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, LogOut, Map, Settings, BarChart3, Package, Gift, ClipboardList, Users, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminNavbarProps {
  currentPage?: 'dashboard' | 'map' | 'centros' | 'donaciones' | 'solicitudes' | 'settings' | 'usuarios' | 'roles'
}

export default function AdminNavbar({ currentPage = 'dashboard' }: AdminNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logout, userEmail, role } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3, page: 'dashboard' as const },
    { href: '/admin/map', label: 'Mapa', icon: Map, page: 'map' as const },
    { href: '/admin/centros', label: 'Centros', icon: Package, page: 'centros' as const },
    { href: '/admin/donaciones', label: 'Donaciones', icon: Gift, page: 'donaciones' as const },
    { href: '/solicitudes', label: 'Solicitudes', icon: ClipboardList, page: 'solicitudes' as const },
    { href: '/admin/settings', label: 'Configuración', icon: Settings, page: 'settings' as const },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users, page: 'usuarios' as const },
    { href: '/admin/roles', label: 'Roles', icon: Shield, page: 'roles' as const },
  ]

  return (
    <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40 shrink-0 w-full">
      <div className="w-full px-2 sm:px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4">
        {/* Izquierda: logo pegado al borde */}
        <Link href="/admin" className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm md:text-base">FC</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base md:text-lg font-bold text-sidebar-foreground leading-tight truncate">FuerzaCivil</h1>
            <p className="text-[10px] md:text-xs text-sidebar-accent-foreground leading-tight">Admin Panel</p>
          </div>
        </Link>

        {/* Centro: navegación desktop */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-0.5 min-w-0 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href} className="shrink-0">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 ${
                    isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Centro: iconos compactos en tablet/móvil */}
        <div className="flex lg:hidden flex-1 items-center justify-center gap-0.5 min-w-0 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href} className="shrink-0">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`px-2 ${
                    isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Derecha: usuario + salir pegados al borde */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          <div className="hidden md:block text-right min-w-0 max-w-[180px] lg:max-w-[220px]">
            <p className="text-xs lg:text-sm font-medium text-sidebar-foreground truncate">{userEmail}</p>
            <p className="text-[10px] lg:text-xs text-sidebar-accent-foreground truncate">{role || 'Usuario'}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-1.5 shrink-0 px-2 sm:px-3"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Salir</span>
          </Button>

          <button
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sidebar-border bg-sidebar-accent">
          <div className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.page
              return (
                <Link key={item.page} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start flex items-center gap-2 ${
                      isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
