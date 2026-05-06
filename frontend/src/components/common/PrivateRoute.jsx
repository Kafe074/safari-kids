import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5f0e8'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:52,marginBottom:12}}>🦁</div>
        <p style={{color:'#2E7D32',fontWeight:600,fontSize:14}}>Cargando Safari Kids...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const userRole = user.rol?.toUpperCase()
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === 'CLIENTE')  return <Navigate to="/mi-cuenta" replace />
    if (userRole === 'EMPLEADO') return <Navigate to="/empleado"  replace />
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
