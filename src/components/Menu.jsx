import CircularProgress from './CircularProgress';
import './Menu.css';

export default function Menu({ username, watchedCount, totalMatches, onSelectTournament, onLogout }) {
  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  return (
    <div className="menu">
      <div className="menu__bg-glow menu__bg-glow--1" />
      <div className="menu__bg-glow menu__bg-glow--2" />

      <header className="menu__header animate-fade-in">
        <div className="menu__greeting">
          <span className="menu__wave">👋</span>
          <div>
            <p className="menu__hello">Hola,</p>
            <h2 className="menu__username">{username}</h2>
          </div>
        </div>
        <button className="menu__logout" onClick={onLogout} title="Cerrar sesión">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </header>

      <div className="menu__content">
        <h3 className="menu__section-title animate-fade-in">Mis Competiciones</h3>

        <button
          className="menu__tournament-card animate-fade-in-up"
          onClick={onSelectTournament}
        >
          <div className="menu__tournament-image">
            <div className="menu__tournament-gradient" />
            <div className="menu__tournament-emoji">🏆</div>
          </div>

          <div className="menu__tournament-info">
            <div className="menu__tournament-text">
              <h3 className="menu__tournament-name">Mundial 2026</h3>
              <p className="menu__tournament-location">🇺🇸 USA · 🇲🇽 México · 🇨🇦 Canadá</p>
              <p className="menu__tournament-stats">
                <span className="menu__tournament-watched">{watchedCount}</span>
                <span className="menu__tournament-separator"> de </span>
                <span>{totalMatches} partidos vistos</span>
              </p>
            </div>

            <div className="menu__tournament-progress">
              <CircularProgress percentage={percentage} size={90} strokeWidth={6} />
            </div>
          </div>

          <div className="menu__tournament-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        <p className="menu__coming-soon animate-fade-in">
          Más competiciones próximamente...
        </p>
      </div>
    </div>
  );
}
