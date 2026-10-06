import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Menu.css';

export default function Explore({ competitions, followedIds, user, onFollowedChange }) {
  const [loadingId, setLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFollowToggle = async (comp) => {
    const isFollowing = followedIds.includes(comp.id);
    setLoadingId(comp.id);

    try {
      if (isFollowing) {
        await supabase
          .from('user_competitions')
          .delete()
          .eq('user_id', user.id)
          .eq('competition_id', comp.id);
      } else {
        await supabase
          .from('user_competitions')
          .insert({
            user_id: user.id,
            competition_id: comp.id
          });
      }
      onFollowedChange();
    } catch (error) {
      console.error("Error al actualizar estado de seguimiento", error);
    }
    setLoadingId(null);
  };

  const filteredCompetitions = competitions
    .filter(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.length - b.name.length);

  return (
    <div className="menu">
      <div className="menu__bg-glow menu__bg-glow--2" />
      <header className="menu__header animate-fade-in" style={{ justifyContent: 'center' }}>
        <h2 className="menu__username">Explorar</h2>
      </header>
      
      <div className="menu__content">
        <p className="menu__desc animate-fade-in" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Sigue las competiciones para que aparezcan en tu menú principal.
        </p>

        {/* Buscador */}
        <div className="animate-fade-in" style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <input 
            type="text" 
            className="login__input"
            placeholder="Buscar competición..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: '16px' }}
          />
        </div>
        
        {filteredCompetitions.map((comp, index) => {
          const isFollowing = followedIds.includes(comp.id);
          
          return (
            <div
              key={comp.id}
              className="menu__tournament-card animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 50}ms`, 
                cursor: 'default',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                gap: '1rem'
              }}
            >
              <div className="menu__tournament-info" style={{ flex: 1, padding: 0 }}>
                <div className="menu__tournament-text">
                  <h3 className="menu__tournament-name" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{comp.name}</h3>
                  <p className="menu__tournament-location" style={{ marginBottom: 0, fontSize: '0.85rem' }}>
                    {comp.id === 'mundial2026' ? '🇺🇸 USA · 🇲🇽 MX · 🇨🇦 CAN' : '📍 ' + comp.name}
                  </p>
                </div>
              </div>

              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(comp);
                  }}
                  disabled={loadingId === comp.id}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: isFollowing ? 'rgba(255,255,255,0.08)' : 'var(--accent-gold)',
                    color: isFollowing ? 'var(--text-secondary)' : '#000',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loadingId === comp.id ? 0.5 : 1,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {loadingId === comp.id ? '...' : isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
              </div>
            </div>
          );
        })}

        <p className="menu__coming-soon">Más competiciones próximamente...</p>
      </div>
    </div>
  );
}
