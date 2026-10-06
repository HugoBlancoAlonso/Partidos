import { useState } from 'react';
import { getFlagUrl, isRealTeam as isRealCountry } from '../data/countryFlags';
import { getBadgeUrl, isRealTeam as isRealClub } from '../data/teamBadges';
import './MatchCard.css';

export default function MatchCard({ match, isWatched, onToggleWatched }) {
  const [expanded, setExpanded] = useState(false);

  const localFlag = getFlagUrl(match.equipo_local) || getBadgeUrl(match.equipo_local);
  const visitFlag = getFlagUrl(match.equipo_visitante) || getBadgeUrl(match.equipo_visitante);
  const localIsReal = isRealCountry(match.equipo_local) || isRealClub(match.equipo_local);
  const visitIsReal = isRealCountry(match.equipo_visitante) || isRealClub(match.equipo_visitante);

  // Formatear fecha
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  let hasPassed = false;
  if (match.fecha && match.hora_espana && match.fecha !== 'Por definir' && match.hora_espana !== 'Por definir') {
    const matchDateStr = `${match.fecha}T${match.hora_espana.padStart(5, '0')}:00+02:00`;
    const matchDate = new Date(matchDateStr);
    if (!isNaN(matchDate.getTime())) {
      hasPassed = new Date() >= matchDate;
    }
  }

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleWatched(match.id);
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.equipo_local)}&background=333&color=fff&rounded=true&bold=true`;
                }}
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.equipo_visitante)}&background=333&color=fff&rounded=true&bold=true`;
                }}
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
          title={isWatched ? 'Marcar como no visto' : 'Marcar como visto'}
          role="switch"
          aria-checked={isWatched}
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
