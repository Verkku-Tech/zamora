'use client'

import Link from 'next/link'
import { Map, Package, LogIn, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PublicNavbarProps {
  currentPage?: 'mapa' | 'centros' | 'solicitudes'
}

export default function PublicNavbar({ currentPage }: PublicNavbarProps) {
  const navItems = [
    { href: '/', label: 'Mapa', icon: Map, page: 'mapa' as const },
    { href: '/centros', label: 'Centros', icon: Package, page: 'centros' as const },
    { href: '/solicitudes', label: 'Solicitudes', icon: ClipboardList, page: 'solicitudes' as const },
  ]

  return (
    <nav className="bg-sidebar border-b border-sidebar-border sticky top-0 z-40 shrink-0 w-full">
      <div className="w-full px-2 sm:px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 md:gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-sidebar-primary rounded-lg flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm md:text-base">FC</span>
          </div>
          <div className="hidden sm:block min-w-0">
            <h1 className="text-base md:text-lg font-bold text-sidebar-foreground leading-tight truncate">FuerzaCivil</h1>
            <p className="text-[10px] md:text-xs text-sidebar-accent-foreground leading-tight">Centros de Acopio</p>
          </div>
        </Link>

        <div className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.page
            return (
              <Link key={item.page} href={item.href} className="shrink-0">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex items-center gap-1.5 px-2 md:px-3 ${
                    isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        <Link href="/login" className="shrink-0 ml-auto">
          <Button variant="ghost" size="sm" className="text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-1.5 px-2 sm:px-3">
            <LogIn className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Iniciar Sesión</span>
          </Button>
        </Link>
      </div>
    </nav>
  )
}
