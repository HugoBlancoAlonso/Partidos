import { useState, useMemo } from 'react';
import MatchCard from './MatchCard';
import './MatchList.css';

export default function MatchList({ matches, watchedCount, totalMatches, isWatched, onToggleWatched, onBack, theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('grupos');

  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  // Aplanar el nuevo formato de JSON si viene como objeto
  const flatMatches = useMemo(() => {
    if (Array.isArray(matches)) return matches;
    
    let all = [];
    if (matches["Fase de Grupos"]) {
      Object.values(matches["Fase de Grupos"]).forEach(jornadaArr => {
        all = [...all, ...jornadaArr];
      });
    }
    if (matches["Fase Eliminatoria"]) {
      all = [...all, ...matches["Fase Eliminatoria"]];
    }
    return all;
  }, [matches]);

  // Separar partidos por fase
  const { groupMatches, knockoutMatches } = useMemo(() => {
    const groups = flatMatches.filter(m => m.fase === 'Fase de Grupos');
    const knockout = flatMatches.filter(m => m.fase === 'Fase Eliminatoria');
    return { groupMatches: groups, knockoutMatches: knockout };
  }, [flatMatches]);

  // Agrupar y ordenar
  const { groupedMatches, orderedKeys } = useMemo(() => {
    const current = activeTab === 'grupos' ? groupMatches : knockoutMatches;
    
    // Ordenar cronológicamente (fecha y hora)
    const sorted = [...current].sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora_espana}:00`);
      const dateB = new Date(`${b.fecha}T${b.hora_espana}:00`);
      return dateA - dateB;
    });

    const sectionsMap = {};
    const sectionsKeys = [];
    
    // Contador para calcular la jornada en fase de grupos
    const groupMatchCounts = {};

    sorted.forEach(match => {
      let sectionName;
      
      if (activeTab === 'grupos') {
        if (match.jornada) {
          sectionName = `Jornada ${match.jornada}`;
        } else {
          const group = match.detalle_fase; // e.g. "Grupo A"
          if (!groupMatchCounts[group]) groupMatchCounts[group] = 0;
          groupMatchCounts[group]++;
          const jornadaNum = Math.ceil(groupMatchCounts[group] / 2);
          sectionName = `Jornada ${jornadaNum}`;
        }
      } else {
        sectionName = match.detalle_fase; // e.g. "Octavos de Final"
      }

      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = {
          datesMap: {},
          datesKeys: []
        };
        sectionsKeys.push(sectionName);
      }

      const [year, month, day] = match.fecha.split('-');
      const dateObj = new Date(year, month - 1, day);
      const dateStr = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const dateKey = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      if (!sectionsMap[sectionName].datesMap[dateKey]) {
        sectionsMap[sectionName].datesMap[dateKey] = [];
        sectionsMap[sectionName].datesKeys.push(dateKey);
      }
      sectionsMap[sectionName].datesMap[dateKey].push(match);
    });

    // Ordenar jornadas de forma estricta (Jornada 1, Jornada 2, etc.) en vez de orden cronológico estricto de aparición
    if (activeTab === 'grupos') {
      sectionsKeys.sort((a, b) => {
        const numA = parseInt(a.replace('Jornada ', ''));
        const numB = parseInt(b.replace('Jornada ', ''));
        return numA - numB;
      });
    }

    return { groupedMatches: sectionsMap, orderedKeys: sectionsKeys };
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
        {orderedKeys.map((sectionKey, index) => (
          <section
            key={sectionKey}
            className="match-list__section animate-fade-in"
            style={{ animationDelay: `${index * 50}ms`, marginBottom: 'var(--space-2xl)' }}
          >
            <h2 className="match-list__phase-title" style={{ fontSize: 'var(--fs-lg)', fontWeight: '800', color: 'var(--text-primary)', textAlign: 'center', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-sm)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{sectionKey}</h2>
            {groupedMatches[sectionKey].datesKeys.map(dateKey => (
              <div key={dateKey} style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 className="match-list__section-title">{dateKey}</h3>
                <div className="match-list__matches">
                  {groupedMatches[sectionKey].datesMap[dateKey].map(match => (
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
        ))}
      </div>
    </div>
  );
}
