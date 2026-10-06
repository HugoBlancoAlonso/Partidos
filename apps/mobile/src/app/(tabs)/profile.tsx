import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('usuario');

  useEffect(() => {
    const loadProfile = async () => {
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
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = user?.role === 1;

  return (
    <LinearGradient 
      colors={['#020617', '#064e3b', '#000000']} 
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.username}>@{username}</Text>
          
          <Text style={styles.comingSoon}>
            Próximamente: Estadísticas detalladas, insignias y mucho más.
          </Text>
        </View>

        <View style={styles.actions}>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/admin/competitions')}
            >
              <Text style={styles.adminButtonText}>⚙️ Añadir Competiciones (Admin)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.links}>
            <TouchableOpacity onPress={() => router.push('/privacidad')}>
              <Text style={styles.linkText}>Política de Privacidad</Text>
            </TouchableOpacity>
            <Text style={styles.linkDivider}>|</Text>
            <TouchableOpacity onPress={() => router.push('/aviso-legal')}>
              <Text style={styles.linkText}>Aviso Legal</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyright}>© {new Date().getFullYear()} Creado por Hugo Blanco</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    padding: 20,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarEmoji: {
    fontSize: 64,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  comingSoon: {
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
    gap: 16,
  },
  adminButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  linkText: {
    color: '#94a3b8',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  linkDivider: {
    color: '#64748b',
    fontSize: 12,
  },
  copyright: {
    color: '#64748b',
    fontSize: 12,
  }
});
