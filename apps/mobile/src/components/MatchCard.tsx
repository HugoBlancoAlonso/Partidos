import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { getFlagUrl, getBadgeUrl, isRealCountry, isRealClub } from '@partidos/core';

export default function MatchCard({ match, isWatched, onToggleWatched }: any) {
  const [expanded, setExpanded] = useState(false);

  const localFlag = getFlagUrl(match.equipo_local) || getBadgeUrl(match.equipo_local);
  const visitFlag = getFlagUrl(match.equipo_visitante) || getBadgeUrl(match.equipo_visitante);
  const localIsReal = isRealCountry(match.equipo_local) || isRealClub(match.equipo_local);
  const visitIsReal = isRealCountry(match.equipo_visitante) || isRealClub(match.equipo_visitante);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'Por definir') return 'Por definir';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.card, isWatched && styles.cardWatched]} 
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.main}>
        <View style={styles.teamsContainer}>
          {/* Equipo Local */}
          <View style={styles.team}>
            {localIsReal && localFlag ? (
              <Image source={{ uri: localFlag }} style={styles.flag} />
            ) : (
              <View style={styles.flagPlaceholder}>
                <Text style={styles.flagInitials}>{match.equipo_local?.substring(0, 3).toUpperCase() || '⚽'}</Text>
              </View>
            )}
            <Text style={styles.teamName} numberOfLines={1}>{match.equipo_local}</Text>
          </View>

          <Text style={styles.vs}>vs</Text>

          {/* Equipo Visitante */}
          <View style={[styles.team, styles.teamAway]}>
            <Text style={styles.teamName} numberOfLines={1}>{match.equipo_visitante}</Text>
            {visitIsReal && visitFlag ? (
              <Image source={{ uri: visitFlag }} style={styles.flag} />
            ) : (
              <View style={styles.flagPlaceholder}>
                <Text style={styles.flagInitials}>{match.equipo_visitante?.substring(0, 3).toUpperCase() || '⚽'}</Text>
              </View>
            )}
          </View>
        </View>

        <Switch
          value={isWatched}
          onValueChange={() => onToggleWatched(match.id)}
          trackColor={{ false: '#334155', true: 'rgba(196, 168, 79, 0.4)' }}
          thumbColor={isWatched ? '#fbbf24' : '#94a3b8'}
        />
      </View>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏆</Text>
            <Text style={styles.detailText}>{match.detalle_fase}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>
              {formatDate(match.fecha)} · {match.hora_espana}h
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🏟️</Text>
            <Text style={styles.detailText}>{match.estadio}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{match.ciudad}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginBottom: 12,
  },
  cardWatched: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderColor: 'rgba(255,255,255,0.02)',
    opacity: 0.7,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 10,
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  teamAway: {
    justifyContent: 'flex-end',
  },
  flag: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
  },
  flagPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagInitials: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  teamName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  vs: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    color: '#94a3b8',
    fontSize: 14,
  }
});
