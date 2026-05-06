import { useState, useMemo, useEffect } from 'preact/hooks';
import { useRoute, useLocation } from 'wouter-preact';
import { ItemTypeMap, LocationMap } from '../../const';
import { useItemStore } from '../../store/item';
import { SearchBar } from '../SearchBar/SearchBar';
import { ItemFilter } from './ItemFilter';
import { ItemCard } from './ItemCard';
import { ItemDialog } from './ItemDialog';
import { lockScreen, unlockScreen } from '../../screen';
import type { ItemSource, LocationSource } from '@manosaba/types';
import type { SearchIndex } from '../SearchBar/SearchBar';
import './style.css';

export const ItemList = () => {
  const [ searchResult, setSearchResult ] = useState<SearchIndex[] | null>(null);
  const [ filterTypes, setFilterTypes ] = useState<string[]>([]);
  const [ filterLocations, setFilterLocations ] = useState<string[]>([]);
  const [, navigate] = useLocation();

  const [match, params] = useRoute('/item/:key');

  const itemsOrig = useItemStore(e => e.items);
  const itemSearchIndex: SearchIndex[] = useMemo(() => (
    itemsOrig.map((e) => ({ id: e.id, name: e.name }))
  ), [ itemsOrig ]);

  const selectedItem = match
    ? itemsOrig.find(e => e.id === params?.key)
    : undefined;

  const updateSearchResult = (results: SearchIndex[] | null) => {
    setSearchResult(results);
  };

  const updateFilterTypes = (filters: string[]) => {
    setFilterTypes(filters);
  };

  const updateFilterLocations = (filters: string[]) => {
    setFilterLocations(filters);
  };

  const items = (
    itemsOrig
      .filter((item) => {
        if (!searchResult) return true;

        return (
          searchResult.findIndex(e => e.id === item.id) !== -1
        );
      })
      .filter((item) => {
        if (filterTypes.length <= 0) return true;
        if (!item.types || item.types.length <= 0) return false;

        return (
          item.types.filter((e) => filterTypes.findIndex(i => i === e) !== -1).length > 0
        )
      })
      .filter((item) => {
        if (filterLocations.length <= 0) return true;

        if (item.weapon) {
          return (
            Object.keys(item.weapon.rooms).filter(e => filterLocations.findIndex(i => e === i) !== -1).length > 0
          );
        }

        if (!item.sources || item.sources.length <= 0) return false;

        return (
          item.sources.filter((e) => (e.type === 'location' || e.type === 'task_reward') && filterLocations.findIndex(i => e.name === i) !== -1).length > 0
        );
      })
  );

  const getBestLocationSource = (sources?: ItemSource[]) => {
    if (!sources || sources.length === 0) return undefined;

    const locationSources = sources.filter((source): source is LocationSource => source.type === 'location');
    if (locationSources.length === 0) return undefined;

    const candidateSources = (
      filterLocations.length > 0
        ? locationSources.filter(source => filterLocations.includes(source.name))
        : locationSources
    );

    if (candidateSources.length === 0) return undefined;

    return candidateSources.reduce((best, current) => {
      const bestProb = best.probability ?? 1;
      const currentProb = current.probability ?? 1;
      return currentProb > bestProb ? current : best;
    });
  };

  useEffect(() => {
    if (match) lockScreen();
    else unlockScreen();
  }, [match]);

  return (
    <>
      <div class="item-list-layout">
        <h1
          class="text-2xl font-bold truncate"
        >道具搜索</h1>

        <SearchBar
          data={itemSearchIndex}
          config={{
            keys: [ 'name' ],
            threshold: 0.3,
          }}
          onSearch={updateSearchResult}
        />

        <ItemFilter
          label='类型：'
          filterMap={ItemTypeMap}
          onFilter={updateFilterTypes}
        />

        <ItemFilter
          label='地点：'
          filterMap={LocationMap}
          onFilter={updateFilterLocations}
        />

        <div class="item-list mt-4">
          {items.map((item) => (
            <ItemCard item={item} source={getBestLocationSource(item.sources)} key={item.id} />
          ))}
        </div>
      </div>

      <div
        class={`fixed inset-0 bg-black transition-opacity duration-300 z-45 ${
          selectedItem ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => navigate('/item')}
      />

      <div
        class={[
          'fixed',
          'right-0',
          'top-0',
          'w-85vw',
          'md:w-30em',
          'h-full',
          'overflow-y-auto',
          'bg-gray-900',
          'border-l',
          'border-gray-700',
          'z-50',
          'transition-transform',
          'duration-300',
          'ease-in-out',
          selectedItem ? 'translate-x-0' : 'translate-x-full'
        ].join(' ')}
      >
        {selectedItem && (
          <>
            <div class="sticky top-0 bg-gray-900 z-10 px-4 pt-2 pb-2 border-b border-gray-800">
              <button
                class="text-gray-400 hover:text-gray-200 transition cursor-pointer"
                onClick={() => navigate('/item')}
              >
                × 关闭
              </button>
            </div>
            <ItemDialog item={selectedItem} />
          </>
        )}
      </div>
    </>
  )
};
