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
          filteredCompetitions.map((comp, index) => {
            const compWatchedCount = comp.allMatchIds ? comp.allMatchIds.filter(id => isWatched(id)).length : 0;
            const percentage = comp.total_partidos > 0 ? (compWatchedCount / comp.total_partidos) * 100 : 0;
            
            return (
              <button
                key={comp.id}
                className="menu__tournament-card animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => onSelectTournament(comp.id)}
              >
                <div className="menu__tournament-image">
                  <div className="menu__tournament-gradient" />
                  <div className="menu__tournament-emoji">🏆</div>
                </div>

                <div className="menu__tournament-info">
                  <div className="menu__tournament-text">
                    <h3 className="menu__tournament-name">{comp.name}</h3>
                    <p className="menu__tournament-location">
                      {comp.id === 'mundial2026' ? '🇺🇸 USA · 🇲🇽 México · 🇨🇦 Canadá' : '📍 ' + comp.name}
                    </p>
                    <p className="menu__tournament-stats">
                      <span className="menu__tournament-watched">{compWatchedCount}</span>
                      <span className="menu__tournament-separator"> de </span>
                      <span>{comp.total_partidos} partidos vistos</span>
                    </p>
                  </div>

                  <div className="menu__tournament-progress">
                    <CircularProgress percentage={percentage > 100 ? 100 : percentage} size={90} strokeWidth={6} />
                  </div>
                </div>

                <div className="menu__tournament-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            );
          })
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
