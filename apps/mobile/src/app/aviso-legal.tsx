import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AvisoLegal() {
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
            <Text style={styles.icon}>⚖️</Text>
          </View>
          <Text style={styles.title}>Aviso Legal</Text>
          <Text style={styles.subtitle}>Última actualización: 6 de Octubre de 2026</Text>
        </View>

        <View style={styles.card}>
          <Section num="1" title="Datos Identificativos">
            En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se reflejan a continuación los datos identificativos del responsable de este sitio web:
            {'\n\n'}Titular: Hugo Blanco
            {'\n'}Contacto: blancoalonso05@gmail.com
          </Section>

          <Section num="2" title="Usuarios y Acceso">
            El acceso y/o uso de esta aplicación atribuye la condición de USUARIO. El usuario acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso reflejadas en el presente documento. Si el usuario no estuviera de acuerdo con cualquiera de las condiciones aquí establecidas, deberá abstenerse de utilizar la app.
          </Section>

          <Section num="3" title="Uso del Portal">
            La plataforma proporciona acceso a información, servicios y funcionalidades ("los contenidos") en Internet pertenecientes a El Titular. El USUARIO asume plenamente la responsabilidad del uso del portal. Dicha responsabilidad se extiende al proceso de registro que fuese necesario para acceder a servicios específicos, donde el usuario será responsable de aportar información veraz y lícita.
          </Section>

          <Section num="4" title="Propiedad Intelectual e Industrial">
            El Titular, por sí mismo o como cesionario, es titular de todos los derechos de propiedad intelectual e industrial de su app, así como de los elementos primarios contenidos en la misma (a título enunciativo: código fuente, diseño de interfaces, arquitectura de navegación, bases de datos, logotipos y combinaciones de colores). Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta app sin la autorización de El Titular.
          </Section>

          <Section num="5" title="Exclusión de Garantías y Responsabilidad">
            El Titular ha adoptado todas las medidas tecnológicas razonables para evitar daños, sin embargo, no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionarse. Esto incluye, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad temporal del portal, o la transmisión de programas maliciosos, a pesar de haber implementado protocolos de seguridad de vanguardia.
          </Section>

          <Section num="6" title="Modificaciones y Actualizaciones">
            El Titular se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en la plataforma, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios prestados a través de la misma, como la forma en la que éstos aparezcan presentados o localizados en su portal.
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
    backgroundColor: 'rgba(196, 168, 79, 0.1)',
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
    backgroundColor: 'rgba(196, 168, 79, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#c4a84f', // accent-gold
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
