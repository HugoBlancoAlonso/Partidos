import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCompetitions() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [parentComps, setParentComps] = useState<any[]>([]);
  
  const [expandedCompId, setExpandedCompId] = useState<number | null>(null);
  const [compTeams, setCompTeams] = useState<string[]>([]);
  
  const [newCompName, setNewCompName] = useState('');
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.role !== 1) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      const { data: comps } = await supabase.from('competitions').select('*').order('start_date', { ascending: false });
      
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
          if (chunk.length < step + 1) hasMore = false;
          else from += step + 1;
        }
      }

      setCompetitions(comps || []);
      setMatches(allMatches);

      // Parent comps are those that actually have matches in DB
      const parents = (comps || []).filter(c => {
        const hasMatches = allMatches.some(m => m.competition_id === c.id);
        if (hasMatches) return true;
        // If no matches and doesn't have '-', it's a real comp with 0 matches
        if (!c.name.includes('-')) return true;
        return false;
      });

      setParentComps(parents);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompClick = (comp: any) => {
    setNewCompName(`${comp.name} - `);
    
    const compMatches = matches.filter(m => m.competition_id === comp.id);
    const teamsSet = new Set<string>();
    compMatches.forEach(m => {
      if (m.equipo_local) teamsSet.add(m.equipo_local);
      if (m.equipo_visitante) teamsSet.add(m.equipo_visitante);
    });
    
    setCompTeams(Array.from(teamsSet).sort());
    setExpandedCompId(comp.id);
  };

  const handleTeamClick = (comp: any, teamName: string) => {
    setNewCompName(`${comp.name} - ${teamName}`);
  };

  const handleCreate = async () => {
    if (!newCompName.trim()) return;
    setCreating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (!newCompName.includes('-')) {
        throw new Error("El formato debe ser 'Nombre Base - Equipo'. Debes incluir un guión.");
      }

      const parts = newCompName.split('-');
      const teamName = parts.pop()?.trim() || '';
      const parentName = parts.join('-').trim();

      const parentComp = competitions.find(c => c.name.toLowerCase() === parentName.toLowerCase());

      if (!parentComp) {
        throw new Error(`No existe la competición base "${parentName}". Copia el nombre exacto de la lista de arriba.`);
      }

      const parentMatches = matches.filter(m => m.competition_id === parentComp.id);
      const filteredMatches = parentMatches.filter(m => 
        m.equipo_local.toLowerCase().includes(teamName.toLowerCase()) || 
        m.equipo_visitante.toLowerCase().includes(teamName.toLowerCase())
      );

      const totalMatches = filteredMatches.length;

      if (totalMatches === 0) {
        throw new Error(`No hay partidos para el equipo "${teamName}" en "${parentName}". Haz click en la lista para no equivocarte.`);
      }

      const { error } = await supabase
        .from('competitions')
        .insert([
          {
            name: newCompName.trim(),
            folder_name: newCompName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
            start_date: parentComp.start_date,
            total_matches: totalMatches
          }
        ]);

      if (error) throw error;

      setSuccessMsg('¡Añadida correctamente! Ve a "Explorar" para seguirla.');
      setNewCompName('');
      loadData(); // recargar
    } catch (err: any) {
      setErrorMsg(err.message || 'Error desconocido');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={{ color: '#fff' }}>No tienes permisos para ver esto.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Panel Admin</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Competiciones Base</Text>
          <Text style={styles.sectionDesc}>
            Estas son las competiciones que tienen partidos subidos. Usa exactamente estos nombres antes del guión para crear competiciones de equipo.
          </Text>

          <View style={styles.listContainer}>
            {parentComps.map(comp => (
              <View key={comp.id} style={styles.compWrapper}>
                <TouchableOpacity 
                  style={[styles.compCard, expandedCompId === comp.id && styles.compCardActive]}
                  onPress={() => handleCompClick(comp)}
                >
                  <Text style={styles.compName}>{comp.name}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{comp.total_matches} partidos</Text>
                  </View>
                </TouchableOpacity>

                {expandedCompId === comp.id && compTeams.length > 0 && (
                  <View style={styles.teamsContainer}>
                    {compTeams.map(team => (
                      <TouchableOpacity 
                        key={team} 
                        style={styles.teamBadge}
                        onPress={() => handleTeamClick(comp, team)}
                      >
                        <Text style={styles.teamText}>{team}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Añadir Nueva Competición</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ej: LaLiga 2026/2027 - Real Madrid"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newCompName}
              onChangeText={setNewCompName}
            />
            
            <TouchableOpacity 
              style={[styles.createBtn, (!newCompName.trim() || creating) && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!newCompName.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.createBtnText}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0d1117',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  listContainer: {
    gap: 12,
  },
  compWrapper: {
    gap: 8,
  },
  compCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compCardActive: {
    borderColor: '#3b82f6',
  },
  compName: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 12,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  teamsContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  teamText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  formContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
  },
  createBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
  },
});
