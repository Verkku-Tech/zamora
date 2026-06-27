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
    <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-3 py-2.5 md:px-4 md:py-4 flex items-center justify-between gap-2">
        {/* Logo and Title */}
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">FC</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-sidebar-foreground">FuerzaCivil</h1>
            <p className="text-xs text-sidebar-accent-foreground">Admin Panel</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`flex items-center gap-2 ${
                    isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Mobile quick nav */}
        <div className="flex md:hidden items-center gap-0.5 flex-1 justify-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`px-2.5 ${
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

        {/* User Info and Logout */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-sidebar-foreground">{userEmail}</p>
              <p className="text-xs text-sidebar-accent-foreground">{role || 'Usuario'}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </Button>

          {/* Mobile Menu Toggle — acceso a menú completo con etiquetas */}
          <button
            className="md:hidden p-2 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sidebar-border bg-sidebar-accent">
          <div className="px-4 py-2 space-y-2">
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
