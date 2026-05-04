import { useState, useMemo } from 'preact/hooks';
import Fuse from 'fuse.js';
// import PinyinMatch from 'pinyin-match'; // TODO
import type { IFuseOptions } from 'fuse.js';
import type { TargetedInputEvent } from 'preact';

export interface SearchIndex {
  id: string,
  name: string,
}

type SearchBarProps = {
  data: SearchIndex[],
  config: IFuseOptions<SearchIndex>,
  onSearch: (result: SearchIndex[] | null) => void,
};

export const SearchBar = ({
  data,
  config,
  onSearch,
}: SearchBarProps) => {
  const [ query, setQuery ] = useState<string>('');

  const fuse = useMemo(() => {
    return new Fuse(data, {
      ...config,
    })
  }, [ data, config ]);

  const handleInput = (e: TargetedInputEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;

    const { value } = target;
    setQuery(value);

    if (!value) {
      onSearch(null);
      return;
    }

    const results = fuse.search(value).map(r => r.item);
    onSearch(results);
  };

  return (
    <div class="mt-2">
      <input
        type='text'
        placeholder='搜索...'
        value={query}
        onInput={handleInput}
        class={[
          'w-full',
          'px-3',
          'py-1',
          'transition',
          'transition-linear',
          'duration-100',
          'border',
          'border-gray-600',
          'hover:border-gray-500',
          'rounded-full',
          'bg-transparent',
          'hover:bg-gray-800',
          'focus:border-blue-400',
          'box-border'
        ].join(' ')}
      />
    </div>
  )
};
