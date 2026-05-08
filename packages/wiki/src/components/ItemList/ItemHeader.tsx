import { ItemTag } from './ItemTag';
import { getTexturePathFromKey, handleTextureFailed } from '../../utils';
import type { ItemType } from '@manosaba/types';

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
            onError={handleTextureFailed}
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
