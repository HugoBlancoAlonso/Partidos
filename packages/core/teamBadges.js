// Mapeo de nombres de equipos a identificadores para sus escudos
// Primera Federación 2026/2027
const teamBadges = {
  // Grupo 1
  "AD Mérida": "ad-merida",
  "Asociación Deportiva Mérida": "ad-merida",
  "Arenas Club": "arenas-club",
  "Athletic Club 'B'": "athletic-club-b",
  "Bilbao Athletic": "athletic-club-b",
  "Barakaldo CF": "barakaldo-cf",
  "CD Coria": "cd-coria",
  "Club Deportivo Coria": "cd-coria",
  "CD Extremadura": "cd-extremadura",
  "Club Deportivo Extremadura": "cd-extremadura",
  "CD Lugo": "cd-lugo",
  "Club Deportivo Lugo": "cd-lugo",
  "CD Mirandés": "cd-mirandes",
  "Club Deportivo Mirandés": "cd-mirandes",
  "CP Cacereño": "cp-cacereno",
  "Club Polideportivo Cacereño": "cp-cacereno",
  "CyD Leonesa": "cyd-leonesa",
  "Cultural y Deportiva Leonesa": "cyd-leonesa",
  "Pontevedra CF": "pontevedra-cf",
  "Pontevedra Club de Fútbol": "pontevedra-cf",
  "Racing Club Ferrol": "racing-club-ferrol",
  "Racing Club de Ferrol": "racing-club-ferrol",
  "RC Deportivo Fabril": "rc-deportivo-fabril",
  "Real Avilés Industrial": "real-aviles-industrial",
  "Real Avilés Industrial Club de Fútbol": "real-aviles-industrial",
  "Real Unión Club": "real-union-club",
  "SD Ponferradina": "sd-ponferradina",
  "Sociedad Deportiva Ponferradina": "sd-ponferradina",
  "UD Logroñés": "ud-logrones",
  "Unión Deportiva Logroñés": "ud-logrones",
  "UD Ourense": "ud-ourense",
  "Unión Deportiva Ourense": "ud-ourense",
  "Unionistas de Salamanca CF": "unionistas-salamanca",
  "Unionistas de Salamanca Club de Fútbol": "unionistas-salamanca",
  "Zamora CF": "zamora-cf",
  "Zamora Club de Fútbol": "zamora-cf",

  // Grupo 2
  "AD Alcorcón": "ad-alcorcon",
  "Águilas FC": "aguilas-fc",
  "Algeciras CF": "algeciras-cf",
  "Antequera CCF": "antequera-ccf",
  "Atlético Madrileño": "atletico-madrileno",
  "CD Teruel": "cd-teruel",
  "CE Europa": "ce-europa",
  "CF Rayo Majadahonda": "cf-rayo-majadahonda",
  "FC Cartagena": "fc-cartagena",
  "Gimnàstic de Tarragona": "gimnastic-tarragona",
  "Hércules de Alicante CF": "hercules-alicante",
  "Juventud de Torremolinos CF": "juventud-torremolinos",
  "Real Jaén CF": "real-jaen",
  "Real Madrid Castilla": "real-madrid-castilla",
  "Real Murcia CF": "real-murcia",
  "Real Zaragoza": "real-zaragoza",
  "SD Huesca": "sd-huesca",
  "UD Ibiza": "ud-ibiza",
  "UE Sant Andreu": "ue-sant-andreu",
  "Villarreal CF 'B'": "villarreal-cf-b",
};

/**
 * Obtiene la URL o ruta del escudo para un equipo
 * @param {string} teamName - Nombre del equipo
 * @returns {string|null} Ruta del escudo o null si no se encuentra
 */
export function getBadgeUrl(teamName) {
  const code = teamBadges[teamName];
  if (!code) return null;
  return `/badges/${code}.png`;
}

/**
 * Verifica si el nombre del equipo es válido/existe en el mapeo
 * @param {string} teamName
 * @returns {boolean}
 */
export function isRealTeam(teamName) {
  return teamBadges.hasOwnProperty(teamName);
}

export default teamBadges;
