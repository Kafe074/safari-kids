import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

async function fetchProfile(rol, token) {
  try {
    const cfg = { headers: { Authorization: `Bearer ${token}` } }
    const r = rol?.toUpperCase()
    if (r === 'CLIENTE') {
      const res = await api.get('/clientes/me', cfg)
      return { idCliente: res.data.data?.idCliente }
    }
    if (r === 'EMPLEADO') {
      const res = await api.get('/empleados/me', cfg)
      return { idEmpleado: res.data.data?.idEmpleado }
    }
  } catch { /* profile fetch is best-effort */ }
  return {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('safari_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (correo, contrasena) => {
    const { data } = await api.post('/auth/login', { correo, contrasena })
    const { token, nombreCompleto, rol } = data.data
    const profile = await fetchProfile(rol, token)
    const userData = { correo, nombreCompleto, rol, token, ...profile }
    localStorage.setItem('safari_token', token)
    localStorage.setItem('safari_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (nombres, apellidos, correo, contrasena, telefono, direccion, fechaNacimiento) => {
    const { data } = await api.post('/auth/register', { nombres, apellidos, correo, contrasena, telefono, direccion, fechaNacimiento })
    const { token, nombreCompleto, rol } = data.data
    const profile = await fetchProfile(rol, token)
    const userData = { correo, nombreCompleto, rol, token, ...profile }
    localStorage.setItem('safari_token', token)
    localStorage.setItem('safari_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('safari_token')
    localStorage.removeItem('safari_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
