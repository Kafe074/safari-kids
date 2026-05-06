import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function MiCuenta() {
  const { user } = useAuth()
  const nombre = user?.nombreCompleto || 'Cliente'

  return (
    <div style={{maxWidth:800,margin:'40px auto',padding:'0 24px',fontFamily:"'Nunito','Segoe UI',sans-serif"}}>
      <div style={{background:'linear-gradient(135deg,#2E7D32,#388e3c)',borderRadius:20,padding:'36px',color:'#fff',marginBottom:28}}>
        <div style={{fontSize:48,marginBottom:12}}>👤</div>
        <h1 style={{fontWeight:900,fontSize:28,margin:'0 0 6px'}}>Hola, {nombre.split(' ')[0]}!</h1>
        <p style={{color:'rgba(255,255,255,0.8)',margin:0}}>Gestiona tus reservas y servicios</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
        <Link to="/reservar" style={{textDecoration:'none'}}>
          <div style={{background:'#fff',borderRadius:16,padding:24,border:'1px solid #eee',textAlign:'center',transition:'box-shadow 0.2s'}}
            onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
            onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{fontSize:36,marginBottom:10}}>📅</div>
            <h3 style={{fontWeight:800,color:'#1a2e1a',margin:'0 0 6px'}}>Nueva Reserva</h3>
            <p style={{color:'#888',fontSize:13,margin:0}}>Agenda tu próxima cita</p>
          </div>
        </Link>
        <Link to="/mi-cuenta/reservas" style={{textDecoration:'none'}}>
          <div style={{background:'#fff',borderRadius:16,padding:24,border:'1px solid #eee',textAlign:'center',transition:'box-shadow 0.2s'}}
            onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.08)'}
            onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
            <div style={{fontSize:36,marginBottom:10}}>📋</div>
            <h3 style={{fontWeight:800,color:'#1a2e1a',margin:'0 0 6px'}}>Mis Reservas</h3>
            <p style={{color:'#888',fontSize:13,margin:0}}>Ver historial completo</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
