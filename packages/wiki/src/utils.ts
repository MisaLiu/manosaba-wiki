
export const getTexturePathFromKey = (key: string) => {
  const [ namespace, id ] = key.split(':');
  if (!namespace || !id) return 'textures/manosaba/master.png';
  return `textures/${namespace}/${id}.png`;
};
