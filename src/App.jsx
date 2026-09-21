import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useWatchedMatches } from './hooks/useWatchedMatches';
import Login from './components/Login';
import Menu from './components/Menu';
import MatchList from './components/MatchList';
import { competitions } from './data/index.js';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('menu'); // 'menu' | 'matches'
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
          setSelectedCompId(null);
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
    setSelectedCompId(null);
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
  if (view === 'matches' && selectedCompId) {
    const activeCompetition = competitions.find(c => c.id === selectedCompId);
    if (!activeCompetition) return <div className="app-loading">Error cargando competición</div>;

    const compWatchedCount = activeCompetition.allMatchIds.filter(id => isWatched(id)).length;

    return (
      <MatchList
        competition={activeCompetition}
        watchedCount={compWatchedCount}
        isWatched={isWatched}
        onToggleWatched={toggleWatched}
        onBack={() => {
          setView('menu');
          setSelectedCompId(null);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Menu view (default)
  return (
    <Menu
      username={username}
      competitions={competitions}
      isWatched={isWatched}
      onSelectTournament={(compId) => {
        setSelectedCompId(compId);
        setView('matches');
      }}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

export default App;
