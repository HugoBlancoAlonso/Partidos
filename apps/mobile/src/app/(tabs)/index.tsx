import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../supabaseClient';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns, padding 20 on sides, 20 gap

export default function MisPartidosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'en-curso' | 'finalizadas'>('en-curso');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [watchedMatches, setWatchedMatches] = useState<number[]>([]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      // 1. Competiciones y partidos
      const { data: comps } = await supabase.from('competitions').select('*').order('start_date', { ascending: false });
      
      // Paginación para no quedarse en el límite de 1000
      let allMatches: any[] = [];
      let from = 0;
      const step = 999;
      let hasMore = true;

      while (hasMore) {
        const { data: chunk, error } = await supabase
          .from('matches')
          .select('*')
          .range(from, from + step);
        
        if (error || !chunk || chunk.length === 0) {
          hasMore = false;
        } else {
          allMatches = [...allMatches, ...chunk];
          if (chunk.length < step + 1) {
            hasMore = false;
          } else {
            from += step + 1;
          }
        }
      }
      
      // 2. Competiciones seguidas
      const { data: follows } = await supabase.from('user_competitions').select('competition_id').eq('user_id', userId);
      const fIds = follows?.map(f => f.competition_id) || [];
      
      // 3. Partidos vistos
      const { data: watched } = await supabase.from('watched_matches').select('match_id').eq('user_id', userId);
      const wIds = watched?.map(w => w.match_id) || [];

      setCompetitions(comps || []);
      setMatches(allMatches);
      setFollowedIds(fIds);
      setWatchedMatches(wIds);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isCompetitionFinished = (comp: any, compMatches: any[]) => {
    const dates = compMatches.map(m => m.fecha).filter(Boolean);
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const ultima_fecha = dates.length > 0 ? dates[0] : null;

    if (!ultima_fecha) return false;
    const lastMatchDate = new Date(ultima_fecha);
    lastMatchDate.setDate(lastMatchDate.getDate() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today > lastMatchDate;
  };

  // Enriquecer y filtrar competiciones
  const myComps = competitions
    .filter(comp => followedIds.includes(comp.id))
    .map(comp => {
      // Lógica de competiciones virtuales
      let compMatches = matches.filter(m => String(m.competition_id) === String(comp.id));
      let isVirtual = false;

      if (compMatches.length === 0 && comp.name.includes('-')) {
        const parts = comp.name.split('-');
        const teamName = parts.pop()?.trim() || '';
        const parentName = parts.join('-').trim();
        
        const parentComp = competitions.find(c => c.name.toLowerCase() === parentName.toLowerCase());
        if (parentComp) {
          const parentMatches = matches.filter(m => String(m.competition_id) === String(parentComp.id));
          compMatches = parentMatches.filter(m => 
            m.equipo_local.toLowerCase().includes(teamName.toLowerCase()) || 
            m.equipo_visitante.toLowerCase().includes(teamName.toLowerCase())
          );
          isVirtual = true;
        }
      }

      const finished = isCompetitionFinished(comp, compMatches);
      
      const compWatchedCount = compMatches.filter(m => watchedMatches.map(String).includes(String(m.id))).length;
      const totalPartidos = compMatches.length > 0 ? compMatches.length : comp.total_partidos;
      const percentage = totalPartidos > 0 ? (compWatchedCount / totalPartidos) * 100 : 0;

      return {
        ...comp,
        compMatches,
        finished,
        compWatchedCount,
        totalPartidos,
        percentage
      };
    })
    .filter(comp => activeTab === 'en-curso' ? !comp.finished : comp.finished);

  const renderCard = (comp: any) => {
    let hash = 0;
    for (let i = 0; i < comp.name.length; i++) {
      hash = comp.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const bgColor = `hsl(${h}, 65%, 85%)`; // Pastel colors

    const percent = comp.totalPartidos > 0 ? (comp.compWatchedCount / comp.totalPartidos) * 100 : 0;
    
    // SVG Circular Progress math
    const radius = 22;
    const stroke = 3.5;
    const normalizedRadius = radius - stroke;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <TouchableOpacity 
        key={comp.id} 
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() => router.push({ pathname: '/competition/[id]', params: { id: comp.id } })}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={2}>{comp.name}</Text>
          <Text style={styles.cardLocation} numberOfLines={1}>
            {comp.id === 'mundial2026' ? '🇺🇸 MX · CA' : '📍 ' + comp.name.split('-')[0].trim()}
          </Text>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.cardStats}>
            <Text style={styles.cardStatsBold}>{comp.compWatchedCount}</Text> / {comp.totalPartidos} vistos
          </Text>
          
          <View style={styles.progressContainer}>
            <Svg height={radius * 2} width={radius * 2}>
              <Circle
                stroke="rgba(0,0,0,0.06)"
                fill="rgba(0,0,0,0.03)"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <Circle
                stroke="#10b981"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                rotation="-90"
                origin={`${radius}, ${radius}`}
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {Math.round(percent)}<Text style={styles.progressPercent}>%</Text>
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  return (
    <LinearGradient 
      colors={['#020617', '#064e3b', '#000000']} 
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fbbf24" />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Competiciones</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'en-curso' && styles.tabActive]}
            onPress={() => setActiveTab('en-curso')}
          >
            <Text style={[styles.tabText, activeTab === 'en-curso' && styles.tabTextActive]}>En curso</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'finalizadas' && styles.tabActive]}
            onPress={() => setActiveTab('finalizadas')}
          >
            <Text style={[styles.tabText, activeTab === 'finalizadas' && styles.tabTextActive]}>Finalizadas</Text>
          </TouchableOpacity>
        </View>

        {myComps.length > 0 ? (
          <View style={styles.grid}>
            {myComps.map(renderCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay competiciones {activeTab === 'en-curso' ? 'en curso' : 'finalizadas'}.</Text>
            {activeTab === 'en-curso' && (
              <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.exploreBtnText}>Seguir nuevas competiciones</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
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
  glow1: {
    position: 'absolute',
    width: 350,
    height: 350,
    backgroundColor: '#fbbf24',
    borderRadius: 175,
    top: -150,
    left: -100,
    opacity: 0.06,
  },
  glow2: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: '#22c55e',
    borderRadius: 150,
    bottom: -100,
    right: -80,
    opacity: 0.05,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60, // SafeArea replacement
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  tab: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: cardWidth,
    height: 165,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardInfo: {
    gap: 8,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111',
    lineHeight: 24,
  },
  cardLocation: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardStats: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    fontWeight: '500',
  },
  cardStatsBold: {
    fontSize: 16,
    color: '#000',
    fontWeight: '900',
  },
  progressContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  progressPercent: {
    fontSize: 9,
    color: 'rgba(0,0,0,0.6)',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  exploreBtn: {
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  exploreBtnText: {
    color: '#000',
    fontWeight: 'bold',
  }
});
