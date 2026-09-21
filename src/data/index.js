// Generador de un prefijo numérico estable basado en el nombre de la carpeta
function getStableIdPrefix(folderName) {
  if (folderName === 'mundial2026') return 0; // Para no romper los datos guardados en la BD de la primera competición
  
  let hash = 0;
  for (let i = 0; i < folderName.length; i++) {
    const char = folderName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a entero de 32 bits
  }
  // Tomamos un número absoluto y lo limitamos para evitar desbordamientos en la BD (Postgres INTEGER max es ~2.14 mil millones)
  // Al multiplicar por 10000 luego, prefix debe ser menor a 200,000. Usamos modulo 100,000.
  return Math.abs(hash) % 100000;
}

const modules = import.meta.glob('./*/partidos.json', { eager: true });

export const competitions = Object.keys(modules).map((path) => {
  const folder = path.split('/')[1];
  
  // Clonamos el objeto para poder modificar los IDs sin alterar el original estático
  const rawData = modules[path].default || modules[path];
  const data = JSON.parse(JSON.stringify(rawData));
  
  const prefix = getStableIdPrefix(folder);
  
  // Si no es el mundial2026, re-escribimos los id_partido dinámicamente para que no colisionen
  if (prefix !== 0) {
    function updateIds(obj) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (item.id_partido) {
            // Se asume que en el JSON original pueden venir copiados (1, 2, 3...) o ya cambiados (2001, 2002...)
            // Para asegurar consistencia total independientemente del JSON, usamos el índice del array + prefijo
            // o simplemente prefijo * 10000 + (item.id_partido % 10000)
            item.id_partido = (prefix * 10000) + (item.id_partido % 10000);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
          updateIds(obj[key]);
        }
      }
    }
    updateIds(data.partidos);
  }
  
  const matchIds = [];
  function collectIds(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (item.id_partido) matchIds.push(item.id_partido);
      });
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        collectIds(obj[key]);
      }
    }
  }
  collectIds(data.partidos);
  
  return {
    id: folder,
    data: data,
    name: data.torneo || folder,
    total_partidos: data.total_partidos || 0,
    partidos: data.partidos || {},
    allMatchIds: matchIds
  };
});
