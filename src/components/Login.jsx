import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Convertir username a email ficticio para Supabase Auth
  const toEmail = (name) => `${name.toLowerCase().trim()}@mundial2026.app`;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            });

          if (profileError) {
            console.error('Error creando perfil:', profileError);
          }

          onLogin(data.user, trimmedUsername.toLowerCase());
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

        // Obtener username del perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        onLogin(data.user, profile?.username || trimmedUsername.toLowerCase());
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login__bg-glow login__bg-glow--1" />
      <div className="login__bg-glow login__bg-glow--2" />

      <div className="login__container animate-fade-in-up">
        <div className="login__header">
          <span className="login__emoji">⚽</span>
          <h1 className="login__title">Mundial 2026</h1>
          <p className="login__subtitle">🇺🇸 🇲🇽 🇨🇦</p>
          <p className="login__desc">Registra los partidos que ves con tus amigos</p>
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label className="login__label" htmlFor="username">
              Nombre de usuario
            </label>
            <input
              id="username"
              className="login__input"
              type="text"
              placeholder="Tu nombre único"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className="login__input"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div className="login__error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            className="login__button login__button--primary"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : isRegister ? (
              'Crear cuenta'
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="login__switch">
          <span className="login__switch-text">
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </span>
          <button
            className="login__switch-btn"
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}
