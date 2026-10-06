import { useNavigate } from 'react-router-dom';
import './Menu.css';

export default function Profile({ user, username, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === 1;

  return (
    <div className="menu">
      <div className="menu__bg-glow menu__bg-glow--1" />
      <header className="menu__header animate-fade-in" style={{ justifyContent: 'center' }}>
        <h2 className="menu__username">Mi Perfil</h2>
      </header>

      <div className="menu__content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginTop: '2rem' }}>
        <div style={{ fontSize: '5rem', background: 'var(--card-bg)', padding: '20px', borderRadius: '50%', boxShadow: '0 8px 32px var(--shadow-color)' }}>
          👤
        </div>
        <h3 className="menu__section-title" style={{ margin: 0, fontSize: '1.5rem' }}>@{username}</h3>

        <p className="menu__coming-soon">
          Próximamente: Estadísticas detalladas, insignias y mucho más.
        </p>

        <div style={{ flex: 1 }} />

        {isAdmin && (
          <button
            onClick={() => navigate('/admin/competitions')}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              borderRadius: '16px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}
          >
            ⚙️ Añadir Competiciones (Admin)
          </button>
        )}

        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '16px',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '2rem'
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      {/* Footer Legal */}
      <div style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '8px' }}>
          <span
            onClick={() => navigate('/privacidad')}
            style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Política de Privacidad
          </span>
          <span style={{ color: 'var(--text-muted)' }}>|</span>
          <span
            onClick={() => navigate('/aviso-legal')}
            style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Aviso Legal
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>© {new Date().getFullYear()} Creado por Hugo Blanco</p>
      </div>
    </div>
  );
}
