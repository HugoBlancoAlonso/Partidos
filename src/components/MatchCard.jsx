import { useState } from 'react';
import { getFlagUrl, isRealTeam } from '../data/countryFlags';
import './MatchCard.css';

export default function MatchCard({ match, isWatched, onToggleWatched }) {
  const [expanded, setExpanded] = useState(false);

  const localFlag = getFlagUrl(match.equipo_local);
  const visitFlag = getFlagUrl(match.equipo_visitante);
  const localIsReal = isRealTeam(match.equipo_local);
  const visitIsReal = isRealTeam(match.equipo_visitante);

  // Formatear fecha
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Comprobar si el partido ya se ha jugado (hora España UTC+2)
  const matchDateStr = `${match.fecha}T${match.hora_espana}:00+02:00`;
  const hasPassed = new Date() >= new Date(matchDateStr);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!hasPassed) {
      alert('¡Este partido todavía no se ha jugado! ⏳');
      return;
    }
    onToggleWatched(match.id_partido);
  };

  return (
    <div
      className={`match-card ${isWatched ? 'match-card--watched' : ''} ${expanded ? 'match-card--expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Vista principal - una línea */}
      <div className="match-card__main">
        <div className="match-card__teams">
          {/* Equipo local */}
          <div className="match-card__team">
            {localIsReal && localFlag ? (
              <img
                className="match-card__flag"
                src={localFlag}
                alt={match.equipo_local}
                loading="lazy"
              />
            ) : (
              <div className="match-card__flag-placeholder">⚽</div>
            )}
            <span className="match-card__team-name">{match.equipo_local}</span>
          </div>

          <span className="match-card__vs">vs</span>

          {/* Equipo visitante */}
          <div className="match-card__team match-card__team--away">
            <span className="match-card__team-name">{match.equipo_visitante}</span>
            {visitIsReal && visitFlag ? (
              <img
                className="match-card__flag"
                src={visitFlag}
                alt={match.equipo_visitante}
                loading="lazy"
              />
            ) : (
              <div className="match-card__flag-placeholder">⚽</div>
            )}
          </div>
        </div>

        {/* Toggle iOS style */}
        <button
          className={`match-card__switch ${isWatched ? 'match-card__switch--on' : ''}`}
          onClick={handleToggle}
          title={!hasPassed ? 'Aún no se ha jugado' : (isWatched ? 'Marcar como no visto' : 'Marcar como visto')}
          role="switch"
          aria-checked={isWatched}
          disabled={!hasPassed}
        >
          <span className="match-card__switch-knob" />
        </button>
      </div>

      {/* Desplegable con info expandida */}
      <div className="match-card__details">
        <div className="match-card__detail-row">
          <span className="match-card__detail-icon">🏆</span>
          <span className="match-card__detail-text">{match.detalle_fase}</span>
        </div>
        <div className="match-card__detail-row">
          <span className="match-card__detail-icon">📅</span>
          <span className="match-card__detail-text">
            {formatDate(match.fecha)} · {match.hora_espana}h
          </span>
        </div>
        <div className="match-card__detail-row">
          <span className="match-card__detail-icon">🏟️</span>
          <span className="match-card__detail-text">{match.estadio}</span>
        </div>
        <div className="match-card__detail-row">
          <span className="match-card__detail-icon">📍</span>
          <span className="match-card__detail-text">{match.ciudad}</span>
        </div>
      </div>
    </div>
  );
}
