import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Convertir username a email ficticio para Supabase Auth
  const toEmail = (name: string) => `${name.toLowerCase().trim()}@mundial2026.app`;

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      setError('Completa todos los campos');
      setLoading(false);
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    const email = toEmail(trimmedUsername);

    try {
      if (isRegister) {
        // Verificar si el username ya existe
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', trimmedUsername.toLowerCase())
          .single();

        if (existingUser) {
          setError('Este nombre de usuario ya está en uso');
          setLoading(false);
          return;
        }

        // Registrar nuevo usuario
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Este nombre de usuario ya está registrado');
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        // Crear perfil
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: trimmedUsername.toLowerCase(),
              role: 2
            });

          if (profileError) {
            console.error('Error creando perfil:', profileError);
          }
          router.replace('/(tabs)');
        }
      } else {
        // Iniciar sesión
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message === 'Invalid login credentials' ? 'Usuario o contraseña incorrectos' : signInError.message);
          setLoading(false);
          return;
        }
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <LinearGradient 
      colors={['#1e1b4b', '#4c1d95', '#020617']} 
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.emoji}>⚽</Text>
            <Text style={styles.title}>Mis Partidos</Text>
            <Text style={styles.subtitle}>🏆 Tus Competiciones</Text>
            <Text style={styles.desc}>Registra los partidos que ves con tus amigos</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre único"
                placeholderTextColor="#64748b"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#1a1a2e" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            </Text>
            <TouchableOpacity onPress={() => {
              setIsRegister(!isRegister);
              setError('');
            }}>
              <Text style={styles.switchBtn}>
                {isRegister ? ' Iniciar sesión' : ' Crear cuenta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark blue/slate background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  glow1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: '#eab308', // Gold
    borderRadius: 150,
    top: -100,
    right: -80,
    opacity: 0.1,
  },
  glow2: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#22c55e', // Green
    borderRadius: 125,
    bottom: -80,
    left: -60,
    opacity: 0.1,
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fbbf24', // Gold
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    letterSpacing: 2,
    color: '#e2e8f0',
    marginBottom: 12,
  },
  desc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94a3b8',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#fbbf24', // Gold
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  switchBtn: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
