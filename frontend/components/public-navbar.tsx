'use client'

import Link from 'next/link'
import { Map, Package, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PublicNavbarProps {
  currentPage?: 'mapa' | 'centros'
}

export default function PublicNavbar({ currentPage }: PublicNavbarProps) {
  const navItems = [
    { href: '/', label: 'Mapa', icon: Map, page: 'mapa' as const },
    { href: '/centros', label: 'Centros', icon: Package, page: 'centros' as const },
  ]

  return (
    <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-3 py-2.5 md:px-4 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">FC</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold text-sidebar-foreground">FuerzaCivil</h1>
            <p className="text-xs text-sidebar-accent-foreground">Centros de Acopio</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex items-center gap-1.5 px-2 md:px-3 ${
                    isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        <Link href="/login">
          <Button variant="ghost" className="text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            <span className="hidden md:inline">Iniciar Sesión</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}
