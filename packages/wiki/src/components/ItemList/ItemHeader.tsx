import { ItemTag } from './ItemTag';
import type { ItemType } from '@manosaba/types';

const getTexturePathFromKey = (key: string) => {
  const [ namespace, id ] = key.split(':');
  if (!namespace || !id) return 'textures/manosaba/master.png';
  return `textures/${namespace}/${id}.png`;
};

type ItemCardHeaderProps = {
  name: string,
  types?: ItemType[],
  textureKey?: string,
};

export const ItemCardHeader = ({
  name,
  types,
  textureKey,
}: ItemCardHeaderProps) => {
  return (
    <div class="flex gap-2">
      {textureKey && (
        <div>
          <img
            src={getTexturePathFromKey(textureKey)}
            class={[
              'w-3.25em',
              'h-3.25em',
            ].join(' ')}
          />
        </div>
      )}
      <div class="flex-1 min-w-0">
        <div class="text-xl truncate">{name}</div>
        {types && types.length > 0 && (
          <ItemTag tags={types} />
        )}
      </div>
    </div>
  );
};
