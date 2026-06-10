import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import PublicLayout    from './components/layout/PublicLayout'
import MainLayout      from './components/layout/MainLayout'
import PrivateRoute    from './components/common/PrivateRoute'
import AdminRoute      from './components/common/AdminRoute'

import LandingPage     from './pages/landing/LandingPage'
import ServiciosPublic from './pages/landing/ServiciosPublic'
import Login           from './pages/auth/Login'
import Register        from './pages/auth/Register'

import MiCuenta        from './pages/cliente/MiCuenta'
import MisReservas     from './pages/cliente/MisReservas'
import MisCompras      from './pages/cliente/MisCompras'
import NuevaReserva    from './pages/cliente/NuevaReserva'

import Dashboard       from './pages/dashboard/Dashboard'
import UsuariosPage    from './pages/usuarios/UsuariosPage'
import ClientesPage    from './pages/clientes/ClientesPage'
import EmpleadosPage   from './pages/empleados/EmpleadosPage'
import ReservasPage    from './pages/reservas/ReservasPage'
import ServiciosPage   from './pages/servicios/ServiciosPage'
import InventarioPage  from './pages/inventario/InventarioPage'
import ProductosPage   from './pages/productos/ProductosPage'
import VentasPage      from './pages/ventas/VentasPage'
import ComprasPage     from './pages/compras/ComprasPage'
import ReportesPage    from './pages/reportes/ReportesPage'
import AdminPage       from './pages/admin/AdminPage'
import EmpleadoHome    from './pages/empleado/EmpleadoHome'
import EmpleadoReservas from './pages/empleado/EmpleadoReservas'
import EmpleadoInstrumentos from './pages/empleado/EmpleadoInstrumentos'
import TiendaPage      from './pages/tienda/TiendaPage'
import CarritoPage     from './pages/tienda/CarritoPage'

import PromocionesPage       from './pages/promociones/PromocionesPage'
import HorariosConfigPage    from './pages/admin/config/HorariosConfigPage'
import AsientosConfigPage    from './pages/admin/config/AsientosConfigPage'
import InsumosConfigPage     from './pages/admin/config/InsumosConfigPage'
import NotificacionesConfigPage from './pages/admin/config/NotificacionesConfigPage'
import SeguridadConfigPage   from './pages/admin/config/SeguridadConfigPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* PUBLIC */}
          <Route element={<PublicLayout />}>
            <Route path="/"          element={<LandingPage />} />
            <Route path="/servicios" element={<ServiciosPublic />} />
            <Route path="/tienda"    element={<TiendaPage />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/registro"  element={<Register />} />
          </Route>

          {/* CLIENTE */}
          <Route element={<PrivateRoute allowedRoles={['CLIENTE']} />}>
            <Route element={<PublicLayout showUserBar />}>
              <Route path="/reservar"           element={<NuevaReserva />} />
              <Route path="/mi-cuenta"          element={<MiCuenta />} />
              <Route path="/mi-cuenta/reservas" element={<MisReservas />} />
              <Route path="/mi-cuenta/compras"  element={<MisCompras />} />
              <Route path="/carrito"            element={<CarritoPage />} />
            </Route>
          </Route>

          {/* ADMINISTRADOR */}
          <Route element={<PrivateRoute allowedRoles={['ADMINISTRADOR']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard"            element={<Dashboard />} />
              <Route path="/reservas"             element={<ReservasPage />} />
              <Route path="/clientes"             element={<ClientesPage />} />
              <Route path="/empleados"            element={<EmpleadosPage />} />
              <Route path="/servicios-admin"      element={<ServiciosPage />} />
              <Route path="/inventario"           element={<InventarioPage />} />
              <Route path="/productos"            element={<ProductosPage />} />
              <Route path="/ventas"               element={<VentasPage />} />
              <Route path="/compras"              element={<ComprasPage />} />
              <Route path="/reportes"             element={<ReportesPage />} />
              <Route path="/promociones"          element={<PromocionesPage />} />
              <Route path="/usuarios"             element={<AdminRoute><UsuariosPage /></AdminRoute>} />
              <Route path="/admin"                element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/admin/horarios"       element={<AdminRoute><HorariosConfigPage /></AdminRoute>} />
              <Route path="/admin/asientos"       element={<AdminRoute><AsientosConfigPage /></AdminRoute>} />
              <Route path="/admin/insumos"        element={<AdminRoute><InsumosConfigPage /></AdminRoute>} />
              <Route path="/admin/notificaciones" element={<AdminRoute><NotificacionesConfigPage /></AdminRoute>} />
              <Route path="/admin/seguridad"      element={<AdminRoute><SeguridadConfigPage /></AdminRoute>} />
            </Route>
          </Route>

          {/* EMPLEADO */}
          <Route element={<PrivateRoute allowedRoles={['EMPLEADO']} />}>
            <Route element={<MainLayout />}>
              <Route path="/empleado"  element={<EmpleadoHome />} />
              <Route path="/mis-citas" element={<EmpleadoReservas />} />
              <Route path="/mis-instrumentos" element={<EmpleadoInstrumentos />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}
