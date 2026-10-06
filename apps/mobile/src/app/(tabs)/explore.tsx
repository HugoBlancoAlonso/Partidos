import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExploreScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      const { data: comps } = await supabase.from('competitions').select('*').order('name');
      const { data: follows } = await supabase.from('user_competitions').select('competition_id').eq('user_id', session.user.id);

      setCompetitions(comps || []);
      setFollowedIds(follows?.map(f => f.competition_id) || []);
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

  const handleToggleFollow = async (comp: any) => {
    if (!userId) return;
    const isFollowing = followedIds.includes(comp.id);
    setLoadingId(comp.id);

    // Optimistic UI
    setFollowedIds(prev => isFollowing ? prev.filter(id => id !== comp.id) : [...prev, comp.id]);

    try {
      if (isFollowing) {
        await supabase
          .from('user_competitions')
          .delete()
          .eq('user_id', userId)
          .eq('competition_id', comp.id);
      } else {
        await supabase
          .from('user_competitions')
          .insert({ user_id: userId, competition_id: comp.id });
      }
    } catch (error) {
      console.error(error);
      // Revert if error
      setFollowedIds(prev => isFollowing ? [...prev, comp.id] : prev.filter(id => id !== comp.id));
    } finally {
      setLoadingId(null);
    }
  };

  const filteredCompetitions = competitions
    .filter(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.length - b.name.length);

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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explorar</Text>
        </View>

        <Text style={styles.desc}>
          Sigue las competiciones para que aparezcan en tu menú principal.
        </Text>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🏆 {competitions.length} competiciones disponibles</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar competición..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>

        {filteredCompetitions.map(comp => {
          const isFollowing = followedIds.includes(comp.id);
          const isLoading = loadingId === comp.id;

          return (
            <View key={comp.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{comp.name}</Text>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  {comp.id === 'mundial2026' ? '🇺🇸 USA · 🇲🇽 MX · 🇨🇦 CAN' : '📍 ' + comp.name}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={() => handleToggleFollow(comp)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? '#94a3b8' : '#000'} />
                ) : (
                  <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <Text style={styles.comingSoon}>Más competiciones próximamente...</Text>
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  desc: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  badgeText: {
    color: '#10b981',
    fontWeight: '600',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 16,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: '#94a3b8',
  },
  followBtn: {
    backgroundColor: '#fbbf24',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  followBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  followingBtnText: {
    color: '#94a3b8',
  },
  comingSoon: {
    textAlign: 'center',
    marginTop: 30,
    color: '#64748b',
    fontStyle: 'italic',
  }
});
