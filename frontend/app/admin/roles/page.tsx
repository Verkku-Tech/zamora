'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/admin-navbar'
import { Button } from '@/components/ui/button'
import { getRoles, updateRole, type RoleApi } from '@/lib/api-client'
import { Shield, Save } from 'lucide-react'

const MODULOS = ['Insumos', 'PuntosInteres', 'ZonasAfectadas', 'Estadisticas', 'Configuracion', 'Usuarios']
const ACCIONES = ['ver', 'crear', 'editar', 'eliminar']

export default function RolesPage() {
  const { isAuthenticated, tienePermiso } = useAuth()
  const router = useRouter()
  const [roles, setRoles] = useState<RoleApi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchRoles()
  }, [isAuthenticated])

  const fetchRoles = async () => {
    try { setRoles(await getRoles()) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const togglePermiso = (roleId: string, modulo: string, accion: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const perms = { ...r.permisos }
      if (!perms[modulo]) perms[modulo] = []
      if (perms[modulo].includes(accion)) {
        perms[modulo] = perms[modulo].filter(a => a !== accion)
        if (perms[modulo].length === 0) delete perms[modulo]
      } else {
        perms[modulo] = [...perms[modulo], accion].sort()
      }
      return { ...r, permisos: perms }
    }))
  }

  const saveRole = async (roleId: string) => {
    setSavingId(roleId)
    const role = roles.find(r => r.id === roleId)
    if (!role) return
    try {
      await updateRole(roleId, { permisos: role.permisos, accesoGlobal: role.accesoGlobal })
    } catch (e: any) { setError(e.message) }
    finally { setSavingId(null) }
  }

  const toggleAccesoGlobal = (roleId: string) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, accesoGlobal: !r.accesoGlobal } : r))
  }

  if (!isAuthenticated || !tienePermiso('Usuarios', 'ver')) {
    return <div className="p-8 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentPage="roles" />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Roles y Permisos</h1>
        </div>

        {error && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm mb-4">{error}</div>}

        {loading ? <p className="text-muted-foreground">Cargando...</p> : (
          <div className="space-y-6">
            {roles.map(role => (
              <div key={role.id} className="border border-border rounded-lg bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{role.nombre}</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={role.accesoGlobal} onChange={() => toggleAccesoGlobal(role.id)} />
                      Acceso global
                    </label>
                    <Button size="sm" onClick={() => saveRole(role.id)} disabled={savingId === role.id}
                      className="flex items-center gap-1 bg-primary text-primary-foreground">
                      <Save className="w-4 h-4" />
                      {savingId === role.id ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MODULOS.map(modulo => (
                    <div key={modulo} className="border border-border rounded p-3">
                      <p className="font-medium text-sm mb-2">{modulo}</p>
                      <div className="flex flex-wrap gap-2">
                        {ACCIONES.map(accion => {
                          const has = role.permisos[modulo]?.includes(accion)
                          return (
                            <label key={accion} className={`flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer border ${has ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary border-border text-muted-foreground'}`}>
                              <input type="checkbox" className="hidden" checked={has} onChange={() => togglePermiso(role.id, modulo, accion)} />
                              {accion}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
