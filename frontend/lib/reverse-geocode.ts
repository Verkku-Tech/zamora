export interface ReverseGeocodeResult {
  direccion: string
  ciudad?: string
  municipio?: string
  estado?: string
}

interface NominatimAddress {
  road?: string
  neighbourhood?: string
  suburb?: string
  quarter?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
  country?: string
}

interface NominatimResponse {
  display_name?: string
  address?: NominatimAddress
}

function pickCity(addr: NominatimAddress): string | undefined {
  return addr.city ?? addr.town ?? addr.village ?? addr.suburb
}

function buildDireccion(addr: NominatimAddress, displayName?: string): string {
  const parts: string[] = []

  if (addr.road) parts.push(addr.road)
  const barrio = addr.neighbourhood ?? addr.suburb ?? addr.quarter
  if (barrio && barrio !== parts[0]) parts.push(barrio)

  if (parts.length > 0) return parts.join(', ')

  if (displayName) {
    const segments = displayName.split(',').map((s) => s.trim())
    return segments.slice(0, 2).join(', ')
  }

  return ''
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '18',
    'accept-language': 'es',
  })

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'FuerzaCivil-Zamora/1.0 (centros-acopio; contacto@fuerzacivil.org)',
    },
  })

  if (!res.ok) {
    return { direccion: '' }
  }

  const data = (await res.json()) as NominatimResponse
  const addr = data.address ?? {}

  return {
    direccion: buildDireccion(addr, data.display_name),
    ciudad: pickCity(addr),
    municipio: addr.municipality ?? addr.county,
    estado: addr.state,
  }
}
