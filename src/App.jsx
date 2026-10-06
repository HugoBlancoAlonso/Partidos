import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useWatchedMatches } from './hooks/useWatchedMatches';
import Login from './components/Login';
import Menu from './components/Menu';
import MatchList from './components/MatchList';
import Layout from './components/Layout';
import Explore from './components/Explore';
import Profile from './components/Profile';
import AdminCompetitions from './components/AdminCompetitions';
import './App.css';

// Componente Wrapper para extraer ID de la URL y renderizar MatchList
function MatchListWrapper({ enrichedCompetitions, dbMatches, isWatched, toggleWatched, theme, toggleTheme, user, onFollowedChange }) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const activeCompetition = enrichedCompetitions.find(c => c.id.toString() === id);

  if (!activeCompetition) return <div className="app-loading">Competición no encontrada</div>;

  const compWatchedCount = activeCompetition.allMatchIds.filter(matchId => isWatched(matchId)).length;
  // Usar los partidos filtrados de la "competición virtual" si existe, si no, los originales de la BD
  const activeMatches = activeCompetition.virtualMatches || dbMatches.filter(m => m.competition_id === activeCompetition.id);

  if (activeMatches.length === 0) {
    return (
      <div style={{ color: 'white', padding: '40px', marginTop: '50px' }}>
        <h2>⚠️ No hay partidos para mostrar</h2>
        <div style={{ background: 'rgba(255,0,0,0.1)', padding: '20px', borderRadius: '10px', marginTop: '20px' }}>
          <h3>Información para arreglarlo:</h3>
          <p>Has entrado en la competición: <b>{activeCompetition.name}</b></p>
          <p>La web está intentando buscar otra competición llamada exactamente igual que la primera parte antes del guión.</p>
          <br/>
          <h4>Competiciones que tienes en tu Base de Datos:</h4>
          <ul>
            {enrichedCompetitions.map(c => (
              <li key={c.id}>
                <b>{c.name}</b> <i>(Tiene {dbMatches.filter(m => m.competition_id === c.id).length} partidos reales)</i>
              </li>
            ))}
          </ul>
          <br/>
          <p><b>¿Ves el problema?</b> Seguramente el nombre de tu competición principal no coincide con la primera parte del nombre de esta.</p>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: 'white', color: 'black', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <MatchList
      competition={activeCompetition}
      matches={activeMatches}
      watchedCount={compWatchedCount}
      isWatched={isWatched}
      onToggleWatched={toggleWatched}
      onBack={() => navigate(-1)} // Volver atrás en el historial
      theme={theme}
      onToggleTheme={toggleTheme}
      user={user}
      onUnfollow={onFollowedChange}
    />
  );
}

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [menuTab, setMenuTab] = useState('en-curso');
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [dbCompetitions, setDbCompetitions] = useState([]);
  const [dbMatches, setDbMatches] = useState([]);
  const [followedCompIds, setFollowedCompIds] = useState([]);

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

  // Función para cargar competiciones seguidas
  const loadFollowedCompetitions = useCallback(async (userId) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('user_competitions')
      .select('competition_id')
      .eq('user_id', userId);
    
    if (data && !error) {
      setFollowedCompIds(data.map(d => d.competition_id));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadFollowedCompetitions(user.id);
    } else {
      setFollowedCompIds([]);
    }
  }, [user, loadFollowedCompetitions]);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', session.user.id)
          .single();

        setUser({ ...session.user, role: profile?.role || 2 });
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

  const handleLogin = (user, name, role) => {
    setUser({ ...user, role: role || 2 });
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
    let compMatches = dbMatches.filter(m => m.competition_id === comp.id);
    let isVirtual = false;

    // LÓGICA VIRTUAL: Si la competición no tiene partidos y su nombre tiene formato "Liga - Equipo"
    if (compMatches.length === 0 && comp.name.includes('-')) {
      const parts = comp.name.split('-');
      // Juntar todo excepto la última parte como el parentName, por si la liga tiene guiones
      const teamName = parts.pop().trim();
      const parentName = parts.join('-').trim();
      
      console.log(`Intentando competición virtual: padre="${parentName}", equipo="${teamName}"`);
      // Buscar la competición padre
      const parentComp = dbCompetitions.find(c => c.name.toLowerCase() === parentName.toLowerCase());
      
      if (parentComp) {
        console.log(`Competición padre encontrada:`, parentComp.name);
        // Obtener los partidos de la competición padre
        const parentMatches = dbMatches.filter(m => m.competition_id === parentComp.id);
        // Filtrar por el equipo
        compMatches = parentMatches.filter(m => 
          m.equipo_local.toLowerCase().includes(teamName.toLowerCase()) || 
          m.equipo_visitante.toLowerCase().includes(teamName.toLowerCase())
        );
        console.log(`Partidos filtrados para el equipo:`, compMatches.length);
        isVirtual = true;
      } else {
        console.log(`No se encontró la competición padre con nombre: "${parentName}"`);
      }
    }

    const matchIds = compMatches.map(m => m.id);
    
    // Calcular última fecha para saber si está finalizada
    const dates = compMatches.map(m => m.fecha).filter(Boolean);
    dates.sort((a, b) => new Date(b) - new Date(a));
    const ultima_fecha = dates.length > 0 ? dates[0] : null;

    return {
      ...comp,
      total_partidos: compMatches.length > 0 ? compMatches.length : comp.total_matches,
      allMatchIds: matchIds,
      ultima_fecha,
      virtualMatches: isVirtual ? compMatches : null
    };
  });

  // Filtramos solo las que el usuario sigue para el Home
  const myCompetitions = enrichedCompetitions.filter(comp => followedCompIds.includes(comp.id));

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} 
      />
      
      {/* Rutas Principales Envueltas en el Layout con el BottomNav */}
      <Route element={user ? <Layout /> : <Navigate to="/login" replace />}>
        
        {/* Mis Competiciones (Menu original filtrado) */}
        <Route 
          path="/" 
          element={
            <Menu
              username={username}
              competitions={myCompetitions}
              isWatched={isWatched}
              onSelectTournament={(compId) => navigate(`/competition/${compId}`)}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
              activeTab={menuTab}
              onTabChange={setMenuTab}
            />
          } 
        />

        {/* Explorar (Todas las competiciones y botones de seguir) */}
        <Route 
          path="/explore" 
          element={
            <Explore 
              competitions={enrichedCompetitions}
              followedIds={followedCompIds}
              user={user}
              onFollowedChange={() => loadFollowedCompetitions(user.id)}
            />
          } 
        />

        {/* Perfil del Usuario */}
        <Route 
          path="/profile" 
          element={
            <Profile 
              user={user}
              username={username}
              onLogout={handleLogout}
            />
          } 
        />

        {/* Panel de Admin para Competiciones */}
        <Route 
          path="/admin/competitions" 
          element={
            <AdminCompetitions 
              enrichedCompetitions={enrichedCompetitions}
              dbMatches={dbMatches}
              user={user}
            />
          } 
        />
      </Route>
      
      {/* Detalle de partidos (Sin BottomNav) */}
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
              user={user}
              onFollowedChange={() => loadFollowedCompetitions(user.id)}
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
