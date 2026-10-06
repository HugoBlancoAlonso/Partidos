import { useNavigate } from 'react-router-dom';
import CircularProgress from './CircularProgress';
import './Menu.css';

export default function Menu({ username, competitions, isWatched, onSelectTournament, onLogout, theme, onToggleTheme, activeTab, onTabChange }) {
  const navigate = useNavigate();

  // Determinar si una competición ha finalizado (ya pasó 1 día desde el último partido)
  const isCompetitionFinished = (comp) => {
    if (!comp.ultima_fecha) return false;
    const lastMatchDate = new Date(comp.ultima_fecha);
    lastMatchDate.setDate(lastMatchDate.getDate() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > lastMatchDate;
  };

  const filteredCompetitions = competitions ? competitions.filter(comp => {
    if (activeTab === 'en-curso') return !isCompetitionFinished(comp);
    return isCompetitionFinished(comp);
  }) : [];

  return (
    <div className="menu">
      <div className="menu__bg-glow menu__bg-glow--1" />
      <div className="menu__bg-glow menu__bg-glow--2" />

      <header className="menu__header animate-fade-in" style={{ justifyContent: 'center' }}>
        <h2 className="menu__username">Mis Competiciones</h2>
      </header>

      <div className="menu__content">
        <div className="menu__tabs animate-fade-in">
          <button 
            className={`menu__tab ${activeTab === 'en-curso' ? 'menu__tab--active' : ''}`}
            onClick={() => onTabChange('en-curso')}
          >
            En curso
          </button>
          <button 
            className={`menu__tab ${activeTab === 'finalizadas' ? 'menu__tab--active' : ''}`}
            onClick={() => onTabChange('finalizadas')}
          >
            Finalizadas
          </button>
        </div>

        {filteredCompetitions.length > 0 ? (
          <div className="menu__grid animate-fade-in">
            {filteredCompetitions.map((comp, index) => {
              const compWatchedCount = comp.allMatchIds ? comp.allMatchIds.filter(id => isWatched(id)).length : 0;
              const percentage = comp.total_partidos > 0 ? (compWatchedCount / comp.total_partidos) * 100 : 0;
              
              // Generar un color pastel consistente basado en el nombre de la competición
              let hash = 0;
              for (let i = 0; i < comp.name.length; i++) {
                hash = comp.name.charCodeAt(i) + ((hash << 5) - hash);
              }
              const h = Math.abs(hash) % 360;
              // Saturación media (60-70%), luminosidad alta (85%) para tonos pastel
              const bgColor = `hsl(${h}, 65%, 85%)`;

              return (
                <button
                  key={comp.id}
                  className="menu__grid-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, background: bgColor }}
                  onClick={() => onSelectTournament(comp.id)}
                >
                  <div className="menu__grid-card-info">
                    <h3 className="menu__grid-card-name">{comp.name}</h3>
                    <p className="menu__grid-card-location">
                      {comp.id === 'mundial2026' ? '🇺🇸 MX · CA' : '📍 ' + comp.name.split('-')[0].trim()}
                    </p>
                  </div>

                  <div className="menu__grid-card-bottom">
                    <div className="menu__grid-card-stats">
                      <strong>{compWatchedCount}</strong> / {comp.total_partidos} vistos
                    </div>
                    <div style={{ marginLeft: '10px' }}>
                      <CircularProgress 
                        percentage={percentage > 100 ? 100 : percentage} 
                        size={46} 
                        strokeWidth={4.5}
                        textColor="#111"
                        trackColor="rgba(0,0,0,0.08)"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="menu__empty-message animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
            <p style={{ margin: 0 }}>No hay competiciones {activeTab === 'en-curso' ? 'en curso' : 'finalizadas'}.</p>
            {activeTab === 'en-curso' && (
              <button 
                onClick={() => navigate('/explore')}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(196, 168, 79, 0.2)'
                }}
              >
                Seguir nuevas competiciones
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
