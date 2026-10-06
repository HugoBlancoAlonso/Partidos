import { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import MatchCard from './MatchCard';
import './MatchList.css';

export default function MatchList({ competition, matches = [], watchedCount, isWatched, onToggleWatched, onBack, theme, onToggleTheme, user, onUnfollow }) {
  const [activeTab, setActiveTab] = useState('grupos');
  const [loadingUnfollow, setLoadingUnfollow] = useState(false);

  const handleUnfollow = async () => {
    if (!window.confirm(`¿Dejar de seguir ${competition.name}?`)) return;
    setLoadingUnfollow(true);
    try {
      if (user) {
        await supabase
          .from('user_competitions')
          .delete()
          .eq('user_id', user.id)
          .eq('competition_id', competition.id);
        
        if (onUnfollow) onUnfollow();
      }
      onBack();
    } catch (error) {
      console.error("Error unfollowing", error);
    }
    setLoadingUnfollow(false);
  };
  
  const totalMatches = competition.total_partidos;
  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  // Separar partidos por fase (usando el prop matches que ya viene plano de Supabase)
  const { groupMatches, knockoutMatches } = useMemo(() => {
    const groups = matches.filter(m => m.fase !== 'Fase Eliminatoria');
    const knockout = matches.filter(m => m.fase === 'Fase Eliminatoria');
    return { groupMatches: groups, knockoutMatches: knockout };
  }, [matches]);

  const hasKnockouts = knockoutMatches.length > 0;

  // Agrupar y ordenar
  const { groupedMatches, orderedKeys } = useMemo(() => {
    const current = activeTab === 'grupos' || !hasKnockouts ? groupMatches : knockoutMatches;
    
    // Ordenar cronológicamente (fecha y hora)
    const sorted = [...current].sort((a, b) => {
      const dateA = new Date(`${a.fecha || '0000-01-01'}T${a.hora_espana || '00:00'}:00`);
      const dateB = new Date(`${b.fecha || '0000-01-01'}T${b.hora_espana || '00:00'}:00`);
      return dateA - dateB;
    });

    const sectionsMap = {};
    const sectionsKeys = [];
    
    // Contador para calcular la jornada en fase de grupos
    const groupMatchCounts = {};

    sorted.forEach(match => {
      let sectionName;
      
      if (activeTab === 'grupos' || !hasKnockouts) {
        if (match.jornada) {
          sectionName = `Jornada ${match.jornada}`;
        } else {
          const group = match.detalle_fase || 'General';
          if (!groupMatchCounts[group]) groupMatchCounts[group] = 0;
          groupMatchCounts[group]++;
          const jornadaNum = Math.ceil(groupMatchCounts[group] / 2);
          sectionName = `Jornada ${jornadaNum}`;
        }
      } else {
        sectionName = match.detalle_fase || 'Fase'; 
      }

      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = { datesMap: {}, datesKeys: [] };
        sectionsKeys.push(sectionName);
      }

      let dateKey = 'Por definir';
      if (match.fecha) {
        const [year, month, day] = match.fecha.split('-');
        const dateObj = new Date(year, month - 1, day);
        const dateStr = dateObj.toLocaleDateString('es-ES', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
        dateKey = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      }

      if (!sectionsMap[sectionName].datesMap[dateKey]) {
        sectionsMap[sectionName].datesMap[dateKey] = [];
        sectionsMap[sectionName].datesKeys.push(dateKey);
      }
      sectionsMap[sectionName].datesMap[dateKey].push(match);
    });

    // Ordenar jornadas de forma estricta (Jornada 1, Jornada 2, etc.)
    if (activeTab === 'grupos' || !hasKnockouts) {
      sectionsKeys.sort((a, b) => {
        const numA = parseInt(a.replace('Jornada ', ''));
        const numB = parseInt(b.replace('Jornada ', ''));
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return 0;
      });
    }

    return { groupedMatches: sectionsMap, orderedKeys: sectionsKeys };
  }, [activeTab, groupMatches, knockoutMatches, hasKnockouts]);

  // Contar vistos por tab
  const groupWatched = groupMatches.filter(m => isWatched(m.id)).length;
  const knockoutWatched = knockoutMatches.filter(m => isWatched(m.id)).length;

  return (
    <div className="match-list">
      {/* Unified Top Navigation */}
      <div className="match-list__top-nav">
        <div className="match-list__header-content">
          <button className="match-list__back" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="match-list__header-text" style={{ flex: 1 }}>
            <h1 className="match-list__title">{competition.name}</h1>
            <p className="match-list__subtitle">{watchedCount} de {totalMatches} partidos vistos</p>
          </div>
          
          <button 
            className="match-list__unfollow-btn"
            onClick={handleUnfollow}
            disabled={loadingUnfollow}
            title="Dejar de seguir competición"
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ff3b30',
              cursor: 'pointer',
              marginLeft: '12px',
              transition: 'all 0.2s ease',
              opacity: loadingUnfollow ? 0.5 : 1
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>

        {/* Tabs inside unified header */}
        {hasKnockouts && (
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
        )}

        {/* Progress bar at bottom of unified header */}
        <div className="match-list__progress-bar">
          <div
            className="match-list__progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
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
                      key={match.id}
                      match={match}
                      isWatched={isWatched(match.id)}
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
