import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import MatchCard from '../../components/MatchCard';

export default function MatchListScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [competition, setCompetition] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [watchedMatchIds, setWatchedMatchIds] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'grupos' | 'eliminatorias'>('grupos');

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      setUserId(uid);

      const { data: comp } = await supabase.from('competitions').select('*').eq('id', id).single();
      
      // Paginación para cargar todos los partidos (o usar un query específico en el futuro)
      let allMatches: any[] = [];
      let from = 0;
      const step = 999;
      let hasMore = true;

      while (hasMore) {
        const { data: chunk, error } = await supabase.from('matches').select('*').range(from, from + step);
        if (error || !chunk || chunk.length === 0) {
          hasMore = false;
        } else {
          allMatches = [...allMatches, ...chunk];
          if (chunk.length < step + 1) hasMore = false;
          else from += step + 1;
        }
      }

      // Lógica de competiciones virtuales
      let matchData = allMatches.filter(m => String(m.competition_id) === String(id));
      if (matchData.length === 0 && comp && comp.name.includes('-')) {
        const parts = comp.name.split('-');
        const teamName = parts.pop()?.trim() || '';
        const parentName = parts.join('-').trim();
        
        // Cargar padre buscando en todas las competiciones localmente para evitar fallos de case-sensitivity en Postgres
        const { data: allComps } = await supabase.from('competitions').select('id, name');
        
        const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        const parentComp = (allComps || []).find(c => normalize(c.name) === normalize(parentName));
        
        if (parentComp) {
          const parentMatches = allMatches.filter(m => String(m.competition_id) === String(parentComp.id));
          matchData = parentMatches.filter(m => 
            normalize(m.equipo_local).includes(normalize(teamName)) || 
            normalize(m.equipo_visitante).includes(normalize(teamName))
          );
        }
      }

      const { data: watchedData } = await supabase.from('watched_matches').select('match_id').eq('user_id', uid);

      setCompetition(comp);
      setMatches(matchData || []);
      setWatchedMatchIds(watchedData?.map(w => w.match_id) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleWatched = async (matchId: number) => {
    if (!userId) return;
    const isWatched = watchedMatchIds.includes(matchId);
    
    // Update local state immediately (Optimistic UI)
    setWatchedMatchIds(prev => 
      isWatched ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );

    try {
      if (isWatched) {
        await supabase
          .from('watched_matches')
          .delete()
          .eq('user_id', userId)
          .eq('match_id', matchId);
      } else {
        await supabase
          .from('watched_matches')
          .insert({ user_id: userId, match_id: matchId });
      }
    } catch (e) {
      console.error('Error toggling match', e);
      // Revert if error
      setWatchedMatchIds(prev => 
        isWatched ? [...prev, matchId] : prev.filter(id => id !== matchId)
      );
    }
  };

  // Separar partidos por fase
  const { groupMatches, knockoutMatches } = useMemo(() => {
    const groups = matches.filter(m => m.fase !== 'Fase Eliminatoria');
    const knockout = matches.filter(m => m.fase === 'Fase Eliminatoria');
    return { groupMatches: groups, knockoutMatches: knockout };
  }, [matches]);

  const hasKnockouts = knockoutMatches.length > 0;
  const currentMatches = activeTab === 'grupos' || !hasKnockouts ? groupMatches : knockoutMatches;

  // Agrupar y ordenar por fecha (simplificado para móvil)
  const groupedMatches = useMemo(() => {
    const sorted = [...currentMatches].sort((a, b) => {
      const dateA = new Date(`${a.fecha || '0000-01-01'}T${a.hora_espana || '00:00'}:00`);
      const dateB = new Date(`${b.fecha || '0000-01-01'}T${b.hora_espana || '00:00'}:00`);
      return dateA.getTime() - dateB.getTime();
    });

    const groups: { [key: string]: any[] } = {};
    sorted.forEach(match => {
      let dateKey = 'Por definir';
      if (match.fecha) {
        const [year, month, day] = match.fecha.split('-');
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        dateKey = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      }
      
      const header = match.jornada ? `Jornada ${match.jornada} - ${dateKey}` : dateKey;
      
      if (!groups[header]) groups[header] = [];
      groups[header].push(match);
    });

    return groups;
  }, [currentMatches]);

  if (loading || !competition) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  const watchedCount = watchedMatchIds.filter(id => matches.some(m => m.id === id)).length;
  const totalMatches = competition.total_partidos || matches.length;
  const percentage = totalMatches > 0 ? (watchedCount / totalMatches) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header Fijo */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>{competition.name}</Text>
            <Text style={styles.subtitle}>{watchedCount} de {totalMatches} partidos vistos</Text>
          </View>
        </View>

        {hasKnockouts && (
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'grupos' && styles.tabActive]}
              onPress={() => setActiveTab('grupos')}
            >
              <Text style={[styles.tabText, activeTab === 'grupos' && styles.tabTextActive]}>Fase de Grupos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'eliminatorias' && styles.tabActive]}
              onPress={() => setActiveTab('eliminatorias')}
            >
              <Text style={[styles.tabText, activeTab === 'eliminatorias' && styles.tabTextActive]}>Eliminatorias</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>

      {/* Lista de Partidos */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />}
      >
        {Object.keys(groupedMatches).map(groupHeader => (
          <View key={groupHeader} style={styles.groupContainer}>
            <Text style={styles.groupHeader}>{groupHeader}</Text>
            {groupedMatches[groupHeader].map(match => (
              <MatchCard 
                key={match.id}
                match={match}
                isWatched={watchedMatchIds.includes(match.id)}
                onToggleWatched={handleToggleWatched}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingTop: 60, // Para iOS SafeArea
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backText: {
    color: '#94a3b8',
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  tabActive: {
    backgroundColor: 'rgba(196, 168, 79, 0.15)',
    borderColor: 'rgba(196, 168, 79, 0.3)',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fbbf24',
  },
  progressBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fbbf24',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  }
});
