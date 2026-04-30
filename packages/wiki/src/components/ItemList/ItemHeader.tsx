import { ItemTag } from './ItemTag';
import type { ItemType } from '@manosaba/types';

type ItemCardHeaderProps = {
  name: string,
  types?: ItemType[],
  icon?: string,
};

export const ItemCardHeader = ({
  name,
  types,
  // icon, // TODO
}: ItemCardHeaderProps) => {
  return (
    <div>
      <div class="text-xl truncate">{name}</div>
      {types && types.length > 0 && (
        <ItemTag tags={types} />
      )}
    </div>
  );
};
