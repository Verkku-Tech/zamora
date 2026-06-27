'use client'

import { PuntoInteres } from '@/lib/mock-data'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Activity, Users, Package, TrendingUp } from 'lucide-react'

interface StatisticsPanelProps {
  centros: PuntoInteres[]
}

export default function StatisticsPanel({ centros }: StatisticsPanelProps) {
  const activos = centros.filter((c) => c.estado_operativo === 'activo').length
  const parciales = centros.filter((c) => c.estado_operativo === 'parcial').length
  const inactivos = centros.filter((c) => c.estado_operativo === 'inactivo').length

  const totalDonaciones = centros.reduce((sum, c) => sum + c.donacionesRecibidas, 0)
  const totalBeneficiarios = centros.reduce((sum, c) => sum + c.beneficiarios, 0)
  const totalCapacidad = centros.reduce((sum, c) => sum + c.capacidad, 0)
  const tasaUtilizacion = Math.round((totalDonaciones / totalCapacidad) * 100)

  const statusData = [
    { name: 'Activos', value: activos, color: '#22c55e' },
    { name: 'Parciales', value: parciales, color: '#eab308' },
    { name: 'Inactivos', value: inactivos, color: '#ef4444' },
  ]

  const donacionesPorCentro = centros.map((c) => ({
    nombre: c.nombre.substring(0, 15),
    donaciones: c.donacionesRecibidas,
    capacidad: c.capacidad,
  }))

  const timelineData = centros
    .sort((a, b) => new Date(a.ultima_actualizacion).getTime() - new Date(b.ultima_actualizacion).getTime())
    .slice(0, 5)
    .map((c) => ({
      nombre: c.nombre.substring(0, 12),
      donaciones: c.donacionesRecibidas,
      beneficiarios: c.beneficiarios,
    }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Centros Activos</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{activos}</p>
            </div>
            <Activity className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Beneficiarios</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{totalBeneficiarios}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Donaciones Totales</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{totalDonaciones}</p>
            </div>
            <Package className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Utilización</p>
              <p className="text-2xl md:text-3xl font-bold text-accent mt-2">{tasaUtilizacion}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Estado de Centros</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Donaciones por Centro</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={donacionesPorCentro}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="nombre" tick={{ fill: 'var(--color-foreground)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--color-foreground)', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
              <Bar dataKey="donaciones" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Tendencia de Donaciones</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="nombre" tick={{ fill: 'var(--color-foreground)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'var(--color-foreground)', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="donaciones" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
