const modules = import.meta.glob('./*/partidos.json', { eager: true });

export const competitions = Object.keys(modules).map((path) => {
  const folder = path.split('/')[1];
  const data = modules[path].default || modules[path];
  
  return {
    id: folder,
    data: data,
    name: data.torneo || folder,
    total_partidos: data.total_partidos || 0,
    partidos: data.partidos || {}
  };
});
