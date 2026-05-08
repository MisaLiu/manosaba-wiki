import type { TargetedEvent } from 'preact';

export const getTexturePathFromKey = (key: string) => {
  const [ namespace, id ] = key.split(':');
  if (!namespace || !id) return 'textures/manosaba/master.png';
  return `textures/${namespace}/${id}.png`;
};

export const handleTextureFailed = (e: TargetedEvent<HTMLImageElement>) => {
  const target = e.target as HTMLImageElement;
  if (!target) return;

  target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR4AQEFAPr/AAAAAAAABQABZHiVOAAAAABJRU5ErkJggg==';
  target.classList.add('texture-missing');
};
