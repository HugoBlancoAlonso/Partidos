import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useWatchedMatches } from './hooks/useWatchedMatches';
import Login from './components/Login';
import Menu from './components/Menu';
import MatchList from './components/MatchList';
import matchData from './data/partidos.json';
import './App.css';

const TOTAL_MATCHES = matchData.total_partidos;
const MATCHES = matchData.partidos;

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('menu'); // 'menu' | 'matches'
  const [sessionLoading, setSessionLoading] = useState(true);

  const { watchedCount, isWatched, toggleWatched, loading: watchedLoading } = useWatchedMatches(user?.id);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Obtener username del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        setUser(session.user);
        setUsername(profile?.username || 'usuario');
      }
      setSessionLoading(false);
    };

    checkSession();

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUsername('');
          setView('menu');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user, name) => {
    setUser(user);
    setUsername(name);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsername('');
    setView('menu');
  };

  // Loading screen
  if (sessionLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__content">
          <span className="app-loading__emoji">⚽</span>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  // No session -> Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Match list view
  if (view === 'matches') {
    return (
      <MatchList
        matches={MATCHES}
        watchedCount={watchedCount}
        totalMatches={TOTAL_MATCHES}
        isWatched={isWatched}
        onToggleWatched={toggleWatched}
        onBack={() => setView('menu')}
      />
    );
  }

  // Menu view (default)
  return (
    <Menu
      username={username}
      watchedCount={watchedCount}
      totalMatches={TOTAL_MATCHES}
      onSelectTournament={() => setView('matches')}
      onLogout={handleLogout}
    />
  );
}

export default App;
