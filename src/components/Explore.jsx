import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Menu.css';

export default function Explore({ competitions, followedIds, user, onFollowedChange }) {
  const [loadingId, setLoadingId] = useState(null);

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
        
        {competitions.map((comp, index) => {
          const isFollowing = followedIds.includes(comp.id);
          
          return (
            <div
              key={comp.id}
              className="menu__tournament-card animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms`, paddingRight: '1rem', cursor: 'default' }}
            >
              <div className="menu__tournament-image">
                <div className="menu__tournament-gradient" />
                <div className="menu__tournament-emoji">🏆</div>
              </div>

              <div className="menu__tournament-info" style={{ flex: 1 }}>
                <div className="menu__tournament-text">
                  <h3 className="menu__tournament-name">{comp.name}</h3>
                  <p className="menu__tournament-location">
                    {comp.id === 'mundial2026' ? '🇺🇸 USA · 🇲🇽 México · 🇨🇦 Canadá' : '📍 ' + comp.name}
                  </p>
                </div>
              </div>

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
                  backgroundColor: isFollowing ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                  color: isFollowing ? 'var(--text-primary)' : '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: loadingId === comp.id ? 0.5 : 1
                }}
              >
                {loadingId === comp.id ? '...' : isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
