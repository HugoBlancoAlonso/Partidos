import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

export default function AdminCompetitions({ enrichedCompetitions, dbMatches, user }) {
  const navigate = useNavigate();
  const [newCompName, setNewCompName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [expandedCompId, setExpandedCompId] = useState(null);
  const [compTeams, setCompTeams] = useState([]);

  // Redirigir si no es admin
  if (user?.role !== 1) {
    return (
      <div className="menu">
        <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>No tienes permisos para ver esto.</div>
      </div>
    );
  }

  // Filtrar las competiciones que NO son virtuales (es decir, las originales que tienen los partidos físicos en la BD)
  const parentCompetitions = enrichedCompetitions.filter(comp => !comp.virtualMatches);

  const handleCompClick = (comp) => {
    setNewCompName(`${comp.name} - `);
    
    // Obtener los equipos únicos de esta competición
    const matches = dbMatches.filter(m => m.competition_id === comp.id);
    const teamsSet = new Set();
    matches.forEach(m => {
      if (m.equipo_local) teamsSet.add(m.equipo_local);
      if (m.equipo_visitante) teamsSet.add(m.equipo_visitante);
    });
    
    setCompTeams(Array.from(teamsSet).sort());
    setExpandedCompId(comp.id);
  };

  const handleTeamClick = (comp, teamName) => {
    setNewCompName(`${comp.name} - ${teamName}`);
    // Scroll suave hasta el input
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCompName.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let totalMatches = 0;
      let startDate = new Date().toISOString().split('T')[0];

      if (!newCompName.includes('-')) {
        throw new Error("El formato debe ser 'Nombre Base - Equipo'. Debes incluir un guión.");
      }

      const parts = newCompName.split('-');
      const teamName = parts.pop().trim();
      const parentName = parts.join('-').trim();

      const parentComp = enrichedCompetitions.find(c => c.name.toLowerCase() === parentName.toLowerCase());

      if (!parentComp) {
        throw new Error(`No existe la competición base "${parentName}". Copia el nombre exacto de la lista de arriba.`);
      }

      const parentMatches = dbMatches.filter(m => m.competition_id === parentComp.id);
      const filteredMatches = parentMatches.filter(m => 
        m.equipo_local.toLowerCase().includes(teamName.toLowerCase()) || 
        m.equipo_visitante.toLowerCase().includes(teamName.toLowerCase())
      );

      totalMatches = filteredMatches.length;

      if (totalMatches === 0) {
        throw new Error(`No hay partidos para el equipo "${teamName}" en "${parentName}". Haz click en la lista para no equivocarte.`);
      }

      startDate = parentComp.start_date;

      const { data, error } = await supabase
        .from('competitions')
        .insert([
          {
            name: newCompName.trim(),
            folder_name: newCompName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
            start_date: startDate,
            total_matches: totalMatches
          }
        ]);

      if (error) throw error;

      setSuccess(true);
      setNewCompName('');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu" style={{ paddingBottom: '100px' }}>
      <div className="menu__bg-glow menu__bg-glow--1" />
      <header className="menu__header animate-fade-in" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="menu__username" style={{ fontSize: '1.2rem' }}>Panel Admin</h2>
        <div style={{ width: 24 }} />
      </header>

      <div className="menu__content" style={{ marginTop: '1rem', padding: '0 20px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Competiciones Base</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Estas son las competiciones que tienen partidos subidos. Usa exactamente estos nombres antes del guión para crear competiciones de equipo. (Ejemplo: "Nombre Base - Equipo")
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2.5rem' }}>
          {parentCompetitions.map(comp => (
            <div key={comp.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                onClick={() => handleCompClick(comp)}
                style={{ 
                  background: 'var(--card-bg)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: expandedCompId === comp.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { if(expandedCompId !== comp.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={(e) => { if(expandedCompId !== comp.id) e.currentTarget.style.backgroundColor = 'var(--card-bg)' }}
                title="Click para ver equipos"
              >
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{comp.name}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  {comp.total_partidos} partidos
                </span>
              </div>

              {expandedCompId === comp.id && compTeams.length > 0 && (
                <div className="animate-fade-in" style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {compTeams.map(team => (
                    <button
                      key={team}
                      type="button"
                      onClick={() => handleTeamClick(comp, team)}
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-secondary)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {parentCompetitions.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
              No hay competiciones subidas.
            </div>
          )}
        </div>

        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.1rem' }}>Añadir Nueva Competición</h3>
        
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Ej: LaLiga 2026/2027 - Real Madrid"
              value={newCompName}
              onChange={e => setNewCompName(e.target.value)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            
            <button
              type="submit"
              disabled={loading || !newCompName.trim()}
              style={{
                padding: '0 24px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: (loading || !newCompName.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !newCompName.trim()) ? 0.5 : 1,
                transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Añadiendo...' : 'Crear'}
            </button>
          </div>
          
          {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
          {success && <div style={{ color: '#10b981', fontSize: '0.9rem', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>¡Añadida correctamente! Ve a "Explorar" para seguirla.</div>}
        </form>
      </div>
    </div>
  );
}
