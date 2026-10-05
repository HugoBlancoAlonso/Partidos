import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useWatchedMatches } from './hooks/useWatchedMatches';
import Login from './components/Login';
import Menu from './components/Menu';
import MatchList from './components/MatchList';
import './App.css';

// Componente Wrapper para extraer ID de la URL y renderizar MatchList
function MatchListWrapper({ enrichedCompetitions, dbMatches, isWatched, toggleWatched, theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const activeCompetition = enrichedCompetitions.find(c => c.id.toString() === id);

  if (!activeCompetition) return <div className="app-loading">Competición no encontrada</div>;

  const compWatchedCount = activeCompetition.allMatchIds.filter(matchId => isWatched(matchId)).length;
  const activeMatches = dbMatches.filter(m => m.competition_id === activeCompetition.id);

  return (
    <MatchList
      competition={activeCompetition}
      matches={activeMatches}
      watchedCount={compWatchedCount}
      isWatched={isWatched}
      onToggleWatched={toggleWatched}
      onBack={() => navigate('/')}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [menuTab, setMenuTab] = useState('en-curso'); // 'en-curso' | 'finalizadas'
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [dbCompetitions, setDbCompetitions] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);

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

  // Cargar datos de Supabase (Competiciones y Partidos)
  useEffect(() => {
    const loadDatabaseData = async () => {
      const [{ data: comps }, { data: matches }] = await Promise.all([
        supabase.from('competitions').select('*').order('start_date', { ascending: false }),
        supabase.from('matches').select('*')
      ]);
      setDbCompetitions(comps || []);
      setDbMatches(matches || []);
      setDataLoading(false);
    };
    loadDatabaseData();
  }, []);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUsername('');
          navigate('/login');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = (user, name) => {
    setUser(user);
    setUsername(name);
    navigate('/');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (sessionLoading || dataLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__content">
          <span className="app-loading__emoji">⚽</span>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  // Preparamos las competiciones con sus correspondientes IDs de partidos para el Menu
  const enrichedCompetitions = dbCompetitions.map(comp => {
    const compMatches = dbMatches.filter(m => m.competition_id === comp.id);
    const matchIds = compMatches.map(m => m.id);
    
    // Calcular última fecha para saber si está finalizada
    const dates = compMatches.map(m => m.fecha).filter(Boolean);
    dates.sort((a, b) => new Date(b) - new Date(a));
    const ultima_fecha = dates.length > 0 ? dates[0] : null;

    return {
      ...comp,
      total_partidos: comp.total_matches,
      allMatchIds: matchIds,
      ultima_fecha
    };
  });

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
      />
      
      <Route 
        path="/" 
        element={
          user ? (
            <Menu
              username={username}
              competitions={enrichedCompetitions}
              isWatched={isWatched}
              onSelectTournament={(compId) => navigate(`/competition/${compId}`)}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
              activeTab={menuTab}
              onTabChange={setMenuTab}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route 
        path="/competition/:id" 
        element={
          user ? (
            <MatchListWrapper 
              enrichedCompetitions={enrichedCompetitions}
              dbMatches={dbMatches}
              isWatched={isWatched}
              toggleWatched={toggleWatched}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
