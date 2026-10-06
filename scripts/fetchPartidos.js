import fs from 'fs';
import crypto from 'crypto';

// Función auxiliar para convertir JSON a CSV
function jsonToCsv(items) {
  if (!items || items.length === 0) return '';
  const header = Object.keys(items[0]);
  const csv = [
    header.join(','),
    ...items.map(row => header.map(fieldName => {
      let data = row[fieldName] === null ? '' : row[fieldName];
      if (typeof data === 'string') {
        data = data.replace(/"/g, '""'); // Escapar comillas dobles
        if (data.includes(',') || data.includes('"') || data.includes('\n')) {
          data = `"${data}"`; // Envolver en comillas si hay comas o saltos de línea
        }
      }
      return data;
    }).join(','))
  ];
  return csv.join('\n');
}

// ==========================================
// 1. CONFIGURACIÓN (FOOTBALL-DATA.ORG)
// ==========================================
// Regístrate en https://www.football-data.org/ para obtener tu API Token gratis
const API_KEY = 'f864a9dfab7a485491b3c07959415400';

// Códigos de ligas gratis en esta API: 
// 'PD' = Primera División España
// 'PL' = Premier League Inglaterra
// 'CL' = Champions League
// 'BL1' = Bundesliga Alemania
// 'SA' = Serie A Italia
// 'FL1' = Ligue 1 Francia
const LEAGUE_CODE = 'CL';
const SEASON = 2026; // Año de inicio de la temporada (2024 es la temporada 2024/2025)

// ==========================================
// 1.1 FILTRO OPCIONAL
// ==========================================
// Deja esto vacío '' para descargar toda la liga entera.
// Si pones un nombre (ej: 'Madrid' o 'Barcelona'), solo bajará los partidos de ese equipo.
const TEAM_FILTER = '';

async function fetchMatches() {
  if (!API_KEY) {
    console.error('❌ ERROR: Por favor, edita el archivo "scripts/fetchPartidos.js" y pon tu API_KEY de football-data.org.');
    return;
  }

  console.log(`📡 Pidiendo datos a football-data.org para la liga ${LEAGUE_CODE}, temporada ${SEASON}...`);

  try {
    // 1. Descargar la lista de equipos para saber sus estadios
    console.log(`🏟️ Obteniendo información de los estadios...`);
    const teamsResponse = await fetch(`https://api.football-data.org/v4/competitions/${LEAGUE_CODE}/teams`, {
      method: 'GET',
      headers: { 'X-Auth-Token': API_KEY }
    });
    const teamsData = await teamsResponse.json();

    // Crear un diccionario para buscar rápido el estadio y ciudad por nombre de equipo
    const teamMap = {};
    if (teamsData.teams) {
      teamsData.teams.forEach(team => {
        let ciudadExtraida = 'Ciudad Local';
        // La API devuelve la dirección ej: "Avenida Concha Espina, 1 Madrid 28036"
        // Extraemos la(s) palabra(s) antes del código postal
        if (team.address) {
          const matchCity = team.address.match(/ ([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)\s+\d{4,5}$/);
          if (matchCity) {
            ciudadExtraida = matchCity[1].trim();
          }
        }
        teamMap[team.name] = {
          venue: team.venue || 'Estadio Local',
          city: ciudadExtraida
        };
      });
    }

    console.log(`📡 Pidiendo datos de partidos a football-data.org para la liga ${LEAGUE_CODE}, temporada ${SEASON}...`);
    const response = await fetch(`https://api.football-data.org/v4/competitions/${LEAGUE_CODE}/matches?season=${SEASON}`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': API_KEY // Esta API usa este nombre para el header
      }
    });

    const data = await response.json();

    if (data.errorCode || data.error) {
      console.error('❌ Error de la API:', data.message || data.error);
      return;
    }

    const matches = data.matches;
    if (!matches || matches.length === 0) {
      console.error('❌ No se encontraron partidos para esta liga y temporada.');
      return;
    }

    console.log(`✅ ¡Se han descargado ${matches.length} partidos de la temporada actual!`);
    console.log(`⚙️ Transformando y generando los archivos...`);

    // ==========================================
    // CREAR LA COMPETICIÓN
    // ==========================================
    const competitionId = crypto.randomUUID();
    const competitionInfo = data.competition;

    // Calcular fecha de inicio
    const sortedMatches = [...matches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const firstMatchDate = new Date(sortedMatches[0].utcDate).toISOString().split('T')[0];

    const competitionData = [{
      id: competitionId,
      name: competitionInfo.name,
      folder_name: competitionInfo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      start_date: firstMatchDate,
      total_matches: matches.length
    }];

    // ==========================================
    // PROCESAR LOS PARTIDOS
    // ==========================================
    const mappedMatches = matches.map(match => {
      // Formateo de fechas a zona horaria de España
      const dateObj = new Date(match.utcDate);

      const formatter = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const partes = formatter.formatToParts(dateObj);
      const getPart = (type) => partes.find(p => p.type === type).value;

      const fecha = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
      const hora_espana = `${getPart('hour')}:${getPart('minute')}`;

      // Buscar el estadio y ciudad real del equipo local
      const infoLocal = teamMap[match.homeTeam.name] || { venue: 'Estadio Local', city: 'Ciudad Local' };

      return {
        id: match.id,
        competition_id: competitionId,
        fase: match.stage || 'REGULAR_SEASON',
        jornada: match.matchday || null,
        detalle_fase: competitionInfo.type === 'LEAGUE' ? `Jornada ${match.matchday}` : match.status,
        equipo_local: match.homeTeam.name,
        equipo_visitante: match.awayTeam.name,
        fecha: fecha,
        hora_espana: hora_espana,
        estadio: infoLocal.venue,
        ciudad: infoLocal.city
      };
    });

    // ==========================================
    // FILTRAR POR EQUIPO (OPCIONAL)
    // ==========================================
    let finalMatches = mappedMatches;

    if (TEAM_FILTER.trim() !== '') {
      finalMatches = mappedMatches.filter(m =>
        m.equipo_local.toLowerCase().includes(TEAM_FILTER.toLowerCase()) ||
        m.equipo_visitante.toLowerCase().includes(TEAM_FILTER.toLowerCase())
      );
      console.log(`\n🔍 Filtrando solo los partidos que contienen: "${TEAM_FILTER}"`);
      console.log(`✅ Se han encontrado ${finalMatches.length} partidos de ese equipo.`);

      // Actualizamos el número de partidos en la info de la competición
      competitionData[0].total_matches = finalMatches.length;
    }

    // ==========================================
    // GUARDAR ARCHIVOS (COMO CSV)
    // ==========================================
    const outputDir = './scripts/competiciones';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const compFileName = `${outputDir}/competicion_${LEAGUE_CODE}_${SEASON}.csv`;
    const matchesFileName = `${outputDir}/partidos_${LEAGUE_CODE}_${SEASON}.csv`;

    fs.writeFileSync(compFileName, jsonToCsv(competitionData), 'utf-8');
    fs.writeFileSync(matchesFileName, jsonToCsv(finalMatches), 'utf-8');

    console.log(`🎉 ¡Éxito! Se han creado los 2 archivos CSV listos para subir a Supabase.`);
    console.log(`1️⃣ Sube PRIMERO: ${compFileName} (a 'competitions')`);
    console.log(`2️⃣ Sube DESPUÉS: ${matchesFileName} (a 'matches')`);

  } catch (error) {
    console.error('❌ Ha ocurrido un error:', error);
  }
}

fetchMatches();
