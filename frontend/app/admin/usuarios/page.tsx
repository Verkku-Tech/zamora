'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import AdminNavbar from '@/components/admin-navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react'
import {
  getUsers, createUser, updateUser, deleteUser,
  getRoles, getPuntosInteres,
  type UserApi, type RoleApi, type PuntoInteresApi,
} from '@/lib/api-client'

export default function UsuariosPage() {
  const { isAuthenticated, tienePermiso } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserApi[]>([])
  const [roles, setRoles] = useState<RoleApi[]>([])
  const [pois, setPois] = useState<PuntoInteresApi[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '', nombre: '', password: '',
    roleId: '', activo: true, puntosInteresIds: [] as string[],
  })

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [u, r, p] = await Promise.all([getUsers(), getRoles(), getPuntosInteres()])
      setUsers(u); setRoles(r); setPois(p)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const resetForm = () => setForm({ email: '', nombre: '', password: '', roleId: '', activo: true, puntosInteresIds: [] })

  const handleCreate = async () => {
    await createUser({ email: form.email, nombre: form.nombre, password: form.password, roleId: form.roleId, puntosInteresIds: form.puntosInteresIds })
    setShowNew(false); resetForm(); fetchData()
  }

  const handleUpdate = async (id: string) => {
    await updateUser(id, { nombre: form.nombre, roleId: form.roleId, activo: form.activo, puntosInteresIds: form.puntosInteresIds, ...(form.password ? { password: form.password } : {}) })
    setEditingId(null); resetForm(); fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await deleteUser(id)
    fetchData()
  }

  const startEdit = (u: UserApi) => {
    setForm({ email: u.email, nombre: u.nombre, password: '', roleId: u.roleId, activo: u.activo, puntosInteresIds: u.puntosInteresIds })
    setEditingId(u.id); setShowNew(false)
  }

  if (!isAuthenticated || !tienePermiso('Usuarios', 'ver')) {
    return <div className="p-8 text-center text-muted-foreground">No tienes permiso para ver esta sección.</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentPage="usuarios" />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
          {tienePermiso('Usuarios', 'crear') && (
            <Button onClick={() => { setShowNew(true); setEditingId(null); resetForm() }} className="bg-primary text-primary-foreground flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </Button>
          )}
        </div>

        {error && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm mb-4">{error}</div>}

        {(showNew || editingId) && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
            <h3 className="font-semibold">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={!!editingId} />
              <Input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              <Input placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="flex items-center gap-4">
              <select value={form.roleId} onChange={e => setForm({...form, roleId: e.target.value})} className="bg-secondary text-foreground border border-border rounded px-3 py-2">
                <option value="">Seleccionar rol...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.activo} onChange={e => setForm({...form, activo: e.target.checked})} />
                Activo
              </label>
            </div>
            <div>
              <p className="text-sm mb-1">Puntos de Interés asignados:</p>
              <div className="max-h-32 overflow-y-auto border border-border rounded p-2">
                {pois.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm py-0.5">
                    <input type="checkbox" checked={form.puntosInteresIds.includes(p.id)}
                      onChange={e => {
                        setForm({...form, puntosInteresIds: e.target.checked ? [...form.puntosInteresIds, p.id] : form.puntosInteresIds.filter(id => id !== p.id)})
                      }}
                    />
                    {p.nombre} ({p.tipo.replace(/_/g, ' ')})
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => editingId ? handleUpdate(editingId) : handleCreate()} className="flex items-center gap-1"><Check className="w-4 h-4" /> Guardar</Button>
              <Button variant="ghost" onClick={() => { setShowNew(false); setEditingId(null); resetForm() }}><X className="w-4 h-4" /> Cancelar</Button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left px-4 py-2">Email</th>
                  <th className="text-left px-4 py-2">Nombre</th>
                  <th className="text-left px-4 py-2">Rol</th>
                  <th className="text-left px-4 py-2">Activo</th>
                  <th className="text-left px-4 py-2">POIs</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.nombre}</td>
                    <td className="px-4 py-2">{u.roleNombre}</td>
                    <td className="px-4 py-2">{u.activo ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-2">{u.puntosInteresIds.length}</td>
                    <td className="px-4 py-2 flex gap-1 justify-end">
                      {tienePermiso('Usuarios', 'editar') && (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(u)}><Edit2 className="w-4 h-4" /></Button>
                      )}
                      {tienePermiso('Usuarios', 'eliminar') && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
