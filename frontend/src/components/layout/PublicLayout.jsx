import { Outlet } from 'react-router-dom'
import PublicNavbar from '../public/PublicNavbar'

export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}
