import { useState, useMemo } from 'react';
import MatchCard from './MatchCard';
import './MatchList.css';

export default function MatchList({ matches, watchedCount, totalMatches, isWatched, onToggleWatched, onBack }) {
  const [activeTab, setActiveTab] = useState('grupos');

  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  // Separar partidos por fase
  const { groupMatches, knockoutMatches } = useMemo(() => {
    const groups = matches.filter(m => m.fase === 'Fase de Grupos');
    const knockout = matches.filter(m => m.fase === 'Fase Eliminatoria');
    return { groupMatches: groups, knockoutMatches: knockout };
  }, [matches]);

  // Agrupar y ordenar por fecha
  const { groupedByDate, orderedKeys } = useMemo(() => {
    const current = activeTab === 'grupos' ? groupMatches : knockoutMatches;
    
    // Ordenar cronológicamente (fecha y hora)
    const sorted = [...current].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora_espana}:00`);
      const dateB = new Date(`${b.fecha}T${b.hora_espana}:00`);
      return dateA - dateB;
    });

    const grouped = {};
    const keys = [];

    sorted.forEach(match => {
      // Usar las partes de la fecha para evitar desfases de zona horaria
      const [year, month, day] = match.fecha.split('-');
      const dateObj = new Date(year, month - 1, day);
      
      const dateStr = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      // Capitalizar primera letra
      const key = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      
      if (!grouped[key]) {
        grouped[key] = [];
        keys.push(key);
      }
      grouped[key].push(match);
    });

    return { groupedByDate: grouped, orderedKeys: keys };
  }, [activeTab, groupMatches, knockoutMatches]);

  // Contar vistos por tab
  const groupWatched = groupMatches.filter(m => isWatched(m.id_partido)).length;
  const knockoutWatched = knockoutMatches.filter(m => isWatched(m.id_partido)).length;

  return (
    <div className="match-list">
      {/* Header */}
      <header className="match-list__header glass-strong">
        <button className="match-list__back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="match-list__header-text">
          <h1 className="match-list__title">Mundial 2026</h1>
          <p className="match-list__subtitle">{watchedCount} de {totalMatches} partidos vistos</p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="match-list__progress-bar">
        <div
          className="match-list__progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Tabs */}
      <div className="match-list__tabs">
        <button
          className={`match-list__tab ${activeTab === 'grupos' ? 'match-list__tab--active' : ''}`}
          onClick={() => setActiveTab('grupos')}
        >
          <span>Fase de Grupos</span>
          <span className="match-list__tab-count">{groupWatched}/{groupMatches.length}</span>
        </button>
        <button
          className={`match-list__tab ${activeTab === 'eliminatorias' ? 'match-list__tab--active' : ''}`}
          onClick={() => setActiveTab('eliminatorias')}
        >
          <span>Eliminatorias</span>
          <span className="match-list__tab-count">{knockoutWatched}/{knockoutMatches.length}</span>
        </button>
      </div>

      {/* Match sections */}
      <div className="match-list__content">
        {orderedKeys.map((phase, index) => (
          <section
            key={phase}
            className="match-list__section animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <h3 className="match-list__section-title">{phase}</h3>
            <div className="match-list__matches">
              {groupedByDate[phase].map(match => (
                <MatchCard
                  key={match.id_partido}
                  match={match}
                  isWatched={isWatched(match.id_partido)}
                  onToggleWatched={onToggleWatched}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
