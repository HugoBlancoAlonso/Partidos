import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';

export function useWatchedMatches(userId) {
  const [watchedIds, setWatchedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const watchedIdsRef = useRef(watchedIds);
  const profileChecked = useRef(false);

  // Mantener ref sincronizada
  useEffect(() => {
    watchedIdsRef.current = watchedIds;
  }, [watchedIds]);

  // Asegurar que el perfil existe
  useEffect(() => {
    if (!userId || profileChecked.current) return;

    async function ensureProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!data) {
        // Intentar crear el perfil si no existe
        const { data: authUser } = await supabase.auth.getUser();
        const email = authUser?.user?.email || '';
        const username = email.split('@')[0] || 'usuario';

        await supabase.from('profiles').insert({
          id: userId,
          username: username,
        });
      }
      profileChecked.current = true;
    }

    ensureProfile();
  }, [userId]);

  // Cargar partidos vistos del usuario
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchWatched() {
      setLoading(true);
      const { data, error } = await supabase
        .from('watched_matches')
        .select('match_id')
        .eq('user_id', userId);

      if (cancelled) return;

      if (error) {
        console.error('Error cargando partidos vistos:', error);
      } else {
        const newSet = new Set(data.map(row => row.match_id));
        setWatchedIds(newSet);
        watchedIdsRef.current = newSet;
      }
      setLoading(false);
    }

    fetchWatched();

    return () => { cancelled = true; };
  }, [userId]);

  // Toggle visto/no visto con optimistic update
  const toggleWatched = useCallback(async (matchId) => {
    if (!userId) return;

    const isCurrentlyWatched = watchedIdsRef.current.has(matchId);

    // Optimistic update
    setWatchedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyWatched) {
        next.delete(matchId);
      } else {
        next.add(matchId);
      }
      watchedIdsRef.current = next;
      return next;
    });

    try {
      if (isCurrentlyWatched) {
        const { error } = await supabase
          .from('watched_matches')
          .delete()
          .eq('user_id', userId)
          .eq('match_id', matchId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('watched_matches')
          .insert({ user_id: userId, match_id: matchId });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error actualizando partido:', error);
      // Mostrar error visible al usuario para diagnosticar
      alert(`Error al guardar: ${error.message || JSON.stringify(error)}`);
      // Revertir optimistic update
      setWatchedIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyWatched) {
          next.add(matchId);
        } else {
          next.delete(matchId);
        }
        watchedIdsRef.current = next;
        return next;
      });
    }
  }, [userId]);

  const isWatched = useCallback((matchId) => {
    return watchedIds.has(matchId);
  }, [watchedIds]);

  return {
    watchedIds,
    watchedCount: watchedIds.size,
    isWatched,
    toggleWatched,
    loading,
  };
}
