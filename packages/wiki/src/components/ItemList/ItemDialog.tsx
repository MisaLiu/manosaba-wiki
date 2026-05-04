import { useState } from 'preact/hooks';
import { ItemCardHeader } from './ItemHeader';
import { ItemWeapon } from './ItemWeapon';
import { MCRichText } from '../MCRichText/MCRichText';
import { getLocationName } from '../../const';
import type { Item, LocationSource, RichTextDocument, TaskRewardSource } from '@manosaba/types';

const ItemSourceWithLocation = ({
  sources
}: { sources: (LocationSource | TaskRewardSource)[] }) => {
  return (
    <>
      {sources
        .sort((a, b) => (b.probability ?? 1) - (a.probability ?? 1))
        .map((source) => (
          <div class="pl-1em text-gray-200">
            {source.type === 'location' ? '搜索获得' : '任务奖励'}
            <span class="text-gray-400">&nbsp;·&nbsp;</span>
            {getLocationName(source.name)}
            <span class="text-gray-400">&nbsp;|&nbsp;</span>
            {Math.round((source.probability ?? 1) * 1000) / 10}%
                {source.count && source.count > 1 && (
                  <>
                    <span class="text-gray-400">×</span>
                    {source.count} 个
                  </>
                )}
            {source.type === 'location' && (
              <>
                <span class="text-gray-400">&nbsp;(</span>
                <>{Math.ceil(1 / (source.probability ?? 1))}&nbsp;</>
                <span class="text-gray-400">次尝试)</span>
              </>
            )}
            {source.type === 'task_reward' && source.role && (
              <>
                <span class="text-gray-400">&nbsp;|&nbsp;</span>
                {
                  source.role === 'werewolf' ? '魔女/共犯' :
                  source.role === 'third_party' ? '杀意魔女' :
                  '预备魔女'
                }
              </>
            )}
          </div>
        ))
      }
    </>
  )
};

type ItemDialogProps = {
  item: Item,
};

export const ItemDialog = ({ item }: ItemDialogProps) => {
  const [ name, setName ] = useState<string>(item.name);
  const [ description, setDiscription ] = useState<RichTextDocument | undefined>(item.descriptionRich);

  const {
    variant,
    sources,
    weapon
  } = item;

  const switchVariant = (index: number) => {
    if (index < 0) {
      setName(item.name);
      setDiscription(item.descriptionRich);
    }

    if (!variant) return;

    const _variant = variant.variants[index];
    if (!_variant) return;

    if (_variant.name) setName(_variant.name);
    if (_variant.descriptionRich) setDiscription(_variant.descriptionRich);
  };

  return (
    <div class="p-4">
      <div class="pb-2">
        <ItemCardHeader
          name={name}
          types={item.types}
        />
      </div>

      {variant && variant.variants.length > 1 && (
        <div class="pb-2 flex flex-nowrap gap-2 overflow-y-hidden overflow-x-auto w-full">
          {variant.variants.map((variant, index) => (
            <button
              class={[
                'min-w-8',
                'px-2',
                'transition',
                'transition-linear',
                'duration-100',
                'border',
                'border-gray-600',
                'hover:border-gray-500',
                'rounded-md',
                'bg-gray-800',
                'hover:bg-gray-700',
                'cursor-pointer',
              ].join(' ')}
              onClick={() => switchVariant(index)}
            >{variant.stateValue ?? variant.slug}</button>
          ))}
        </div>
      )}

      <MCRichText document={description} />

      {sources && sources.length > 0 && (
        <div class="pt-2">
          <div>来源：</div>
          <ItemSourceWithLocation
            sources={sources.filter(e => e.type === 'location')}
          />

          <ItemSourceWithLocation
            sources={sources.filter(e => e.type === 'task_reward')}
          />

          {sources.filter(e => e.type === 'crafting').length > 0 && (
            <div class="pl-1em">合成配方</div>
          )}
        </div>
      )}

      {weapon && (
        <ItemWeapon info={weapon} />
      )}
    </div>
  )
};
