import { useState, useMemo } from 'react';
import MatchCard from './MatchCard';
import './MatchList.css';

export default function MatchList({ matches, watchedCount, totalMatches, isWatched, onToggleWatched, onBack, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('grupos');

  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  // Separar partidos por fase
  const { groupMatches, knockoutMatches } = useMemo(() => {
    const groups = matches.filter(m => m.fase === 'Fase de Grupos');
    const knockout = matches.filter(m => m.fase === 'Fase Eliminatoria');
    return { groupMatches: groups, knockoutMatches: knockout };
  }, [matches]);

  // Agrupar y ordenar
  const { isNested, groupedMatches, orderedKeys } = useMemo(() => {
    const current = activeTab === 'grupos' ? groupMatches : knockoutMatches;
    
    // Ordenar cronológicamente (fecha y hora)
    const sorted = [...current].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora_espana}:00`);
      const dateB = new Date(`${b.fecha}T${b.hora_espana}:00`);
      return dateA - dateB;
    });

    if (activeTab === 'grupos') {
      const grouped = {};
      const keys = [];

      sorted.forEach(match => {
        const [year, month, day] = match.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        
        const dateStr = dateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        const key = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        
        if (!grouped[key]) {
          grouped[key] = [];
          keys.push(key);
        }
        grouped[key].push(match);
      });

      return { isNested: false, groupedMatches: grouped, orderedKeys: keys };
    } else {
      // Eliminatorias: Fase -> Fecha
      const phasesMap = {};
      const phasesKeys = [];

      sorted.forEach(match => {
        const phaseName = match.detalle_fase;
        if (!phasesMap[phaseName]) {
          phasesMap[phaseName] = {
            datesMap: {},
            datesKeys: []
          };
          phasesKeys.push(phaseName);
        }

        const [year, month, day] = match.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        const dateStr = dateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        });
        const dateKey = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        if (!phasesMap[phaseName].datesMap[dateKey]) {
          phasesMap[phaseName].datesMap[dateKey] = [];
          phasesMap[phaseName].datesKeys.push(dateKey);
        }
        phasesMap[phaseName].datesMap[dateKey].push(match);
      });

      return { isNested: true, groupedMatches: phasesMap, orderedKeys: phasesKeys };
    }
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
        <div className="match-list__header-text" style={{ flex: 1 }}>
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
        {!isNested ? (
          orderedKeys.map((dateKey, index) => (
            <section
              key={dateKey}
              className="match-list__section animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h3 className="match-list__section-title">{dateKey}</h3>
              <div className="match-list__matches">
                {groupedMatches[dateKey].map(match => (
                  <MatchCard
                    key={match.id_partido}
                    match={match}
                    isWatched={isWatched(match.id_partido)}
                    onToggleWatched={onToggleWatched}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          orderedKeys.map((phaseKey, index) => (
            <section
              key={phaseKey}
              className="match-list__section animate-fade-in"
              style={{ animationDelay: `${index * 50}ms`, marginBottom: 'var(--space-2xl)' }}
            >
              <h2 className="match-list__phase-title" style={{ fontSize: 'var(--fs-lg)', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{phaseKey}</h2>
              {groupedMatches[phaseKey].datesKeys.map(dateKey => (
                <div key={dateKey} style={{ marginBottom: 'var(--space-lg)' }}>
                  <h3 className="match-list__section-title">{dateKey}</h3>
                  <div className="match-list__matches">
                    {groupedMatches[phaseKey].datesMap[dateKey].map(match => (
                      <MatchCard
                        key={match.id_partido}
                        match={match}
                        isWatched={isWatched(match.id_partido)}
                        onToggleWatched={onToggleWatched}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
