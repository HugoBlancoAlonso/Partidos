// Mapeo de nombres de países (en español) a códigos ISO 3166-1 alpha-2
// Usado para obtener banderas de flagcdn.com
const countryFlags = {
  // Grupo A
  "México": "mx",
  "Sudáfrica": "za",
  "Corea del Sur": "kr",
  "República Checa": "cz",

  // Grupo B
  "Canadá": "ca",
  "Suiza": "ch",
  "Catar": "qa",
  "Bosnia y Herzegovina": "ba",

  // Grupo C
  "Brasil": "br",
  "Marruecos": "ma",
  "Haití": "ht",
  "Escocia": "gb-sct",

  // Grupo D
  "Estados Unidos": "us",
  "Paraguay": "py",
  "Australia": "au",
  "Turquía": "tr",

  // Grupo E
  "Alemania": "de",
  "Curazao": "cw",
  "Costa de Marfil": "ci",
  "Ecuador": "ec",

  // Grupo F
  "Países Bajos": "nl",
  "Japón": "jp",
  "Túnez": "tn",
  "Suecia": "se",

  // Grupo G
  "Bélgica": "be",
  "Egipto": "eg",
  "Irán": "ir",
  "Nueva Zelanda": "nz",

  // Grupo H
  "España": "es",
  "Cabo Verde": "cv",
  "Arabia Saudí": "sa",
  "Uruguay": "uy",

  // Grupo I
  "Francia": "fr",
  "Senegal": "sn",
  "Irak": "iq",
  "Noruega": "no",

  // Grupo J
  "Argentina": "ar",
  "Argelia": "dz",
  "Austria": "at",
  "Jordania": "jo",

  // Grupo K
  "Portugal": "pt",
  "RD Congo": "cd",
  "Uzbekistán": "uz",
  "Colombia": "co",

  // Grupo L
  "Inglaterra": "gb-eng",
  "Croacia": "hr",
  "Ghana": "gh",
  "Panamá": "pa",
};

/**
 * Obtiene la URL de la bandera circular para un país
 * @param {string} countryName - Nombre del país en español
 * @returns {string|null} URL de la bandera o null si no se encuentra
 */
export function getFlagUrl(countryName) {
  const code = countryFlags[countryName];
  if (!code) return null;
  // flagcdn.com provee PNGs de banderas por código ISO
  return `https://flagcdn.com/w80/${code}.png`;
}

/**
 * Verifica si el nombre del equipo es un equipo real (no genérico de eliminatorias)
 * @param {string} teamName
 * @returns {boolean}
 */
export function isRealTeam(teamName) {
  return countryFlags.hasOwnProperty(teamName);
}

export default countryFlags;
