'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { login as apiLogin, ApiError } from './api-client'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  userName: string | null
  role: string | null
  permisos: Record<string, string[]>
  accesoGlobal: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  getToken: () => string | null
  tienePermiso: (modulo: string, accion: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [permisos, setPermisos] = useState<Record<string, string[]>>({})
  const [accesoGlobal, setAccesoGlobal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUserEmail(payload.email ?? null)
        setUserName(payload.nombre ?? null)
        setRole(payload.role ?? null)
        setPermisos(typeof payload.permisos === 'string' ? JSON.parse(payload.permisos) : (payload.permisos ?? {}))
        setAccesoGlobal(payload.acceso_global === 'true')
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('auth_token')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await apiLogin(email, password)
      localStorage.setItem('auth_token', res.token)
      setUserEmail(res.email)
      setUserName(res.nombre)
      setRole(res.role)
      setPermisos(res.permisos)
      setAccesoGlobal(res.accesoGlobal)
      setIsAuthenticated(true)
    } catch (err) {
      if (err instanceof ApiError) throw new Error(err.message)
      throw new Error('Error al iniciar sesión')
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    setUserEmail(null)
    setUserName(null)
    setRole(null)
    setPermisos({})
    setAccesoGlobal(false)
    setIsAuthenticated(false)
  }, [])

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }, [])

  const tienePermiso = useCallback((modulo: string, accion: string) => {
    return permisos[modulo]?.includes(accion) ?? false
  }, [permisos])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userName, role, permisos, accesoGlobal, login, logout, getToken, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth()
  useEffect(() => {
    if (!auth.isAuthenticated && typeof window !== 'undefined') {
      window.location.href = redirectTo
    }
  }, [auth.isAuthenticated, redirectTo])
  return auth
}
