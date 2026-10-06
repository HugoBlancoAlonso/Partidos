import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { getFlagUrl, getBadgeUrl, isRealCountry, isRealClub } from '@partidos/core';

export default function HomeScreen() {
  const equiposDemo = [
    { nombre: 'España', tipo: 'pais' },
    { nombre: 'Argentina', tipo: 'pais' },
    { nombre: 'Francia', tipo: 'pais' },
    { nombre: 'Real Madrid Castilla', tipo: 'club' },
    { nombre: 'CD Lugo', tipo: 'club' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Partidos Mobile</Text>
          <Text style={styles.subtitle}>Conectado al Core del Monorepo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prueba de Lógica Compartida</Text>
          <Text style={styles.cardText}>
            Estos datos vienen directamente del paquete @partidos/core que sacamos de tu web.
          </Text>

          {equiposDemo.map((equipo, index) => {
            const url = equipo.tipo === 'pais' ? getFlagUrl(equipo.nombre) : getBadgeUrl(equipo.nombre);
            const isValid = equipo.tipo === 'pais' ? isRealCountry(equipo.nombre) : isRealClub(equipo.nombre);

            return (
              <View key={index} style={styles.row}>
                {isValid && url ? (
                  <Image source={{ uri: url }} style={styles.image} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text>⚽</Text>
                  </View>
                )}
                <Text style={styles.teamName}>{equipo.nombre}</Text>
                <Text style={styles.status}>✅ Funciona</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 20,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  placeholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    color: '#e4e4e7',
    marginLeft: 12,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
