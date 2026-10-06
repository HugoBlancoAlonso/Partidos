import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Privacidad() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documentación Legal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <Text style={styles.icon}>🛡️</Text>
          </View>
          <Text style={styles.title}>Política de Privacidad</Text>
          <Text style={styles.subtitle}>Última actualización: 6 de Octubre de 2026</Text>
        </View>

        <View style={styles.card}>
          <Section num="1" title="Información sobre la recopilación de datos">
            En esta app respetamos y protegemos los datos personales de los usuarios. Como usuario, debes saber que tus derechos están garantizados. Hemos adaptado esta app a las exigencias del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016 (RGPD) relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales.
          </Section>

          <Section num="2" title="¿Qué datos personales recopilamos?">
            Para el correcto funcionamiento de nuestra plataforma, recopilamos y procesamos los siguientes datos:
            {'\n\n'}• Datos de cuenta: Dirección de correo electrónico y contraseña (esta última se almacena de forma encriptada e irreversible).
            {'\n'}• Datos de uso: Tu actividad dentro de la aplicación, como los partidos que marcas como vistos y las competiciones a las que decides hacer seguimiento.
          </Section>

          <Section num="3" title="Proveedores de servicios de terceros">
            Para garantizar la máxima seguridad y rendimiento, nuestra base de datos y sistema de autenticación están delegados y gestionados por Supabase, un servicio de infraestructura Backend-as-a-Service (BaaS) de primer nivel que cumple con los estándares internacionales más estrictos de privacidad y protección de datos.
          </Section>

          <Section num="4" title="¿Con qué finalidad tratamos tus datos?">
            Tus datos se utilizan única y exclusivamente para propósitos operativos de la aplicación:
            {'\n\n'}• Mantener tu sesión iniciada de forma segura en distintos dispositivos.
            {'\n'}• Sincronizar y persistir tu progreso (partidos visualizados y ligas seguidas) en la nube.
            {'\n'}• Garantizar la integridad y seguridad de tu cuenta frente a accesos no autorizados.
          </Section>

          <Section num="5" title="Ejercicio de tus derechos">
            Cualquier persona tiene pleno derecho a obtener confirmación sobre si estamos tratando datos personales que le conciernen. Como interesado, tienes derecho a:
            {'\n\n'}• Solicitar el acceso a los datos personales relativos al interesado.
            {'\n'}• Solicitar su rectificación o supresión definitiva.
            {'\n'}• Solicitar la limitación de su tratamiento.
            {'\n\n'}Para ejercer cualquiera de estos derechos, puedes ponerte en contacto directamente con nuestro equipo de soporte enviando un correo electrónico a:
            {'\n'}blancoalonso05@gmail.com
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ num, title, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{num}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  sectionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 24,
    fontSize: 15,
  },
});
