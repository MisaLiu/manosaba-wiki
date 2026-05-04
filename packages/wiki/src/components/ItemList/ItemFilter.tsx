import { useRef } from 'preact/hooks';
import type { TargetedEvent } from 'preact';

type ItemFilterProps = {
  label: string,
  filterMap: Record<string, string>,
  onFilter: (filters: string[]) => void,
};

export const ItemFilter = ({
  label,
  filterMap,
  onFilter
}: ItemFilterProps) => {
  const filtersRef = useRef<string[]>([]);

  const updateFilter = (id: string, enabled: boolean) => {
    if (!enabled) {
      filtersRef.current = filtersRef.current.filter(e => e !== id);
    } else {
      filtersRef.current.push(id);
    }

    onFilter([ ...filtersRef.current ]);
  };

  const handleFilter = (e: TargetedEvent<HTMLInputElement>, id: string) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;

    const { checked } = target;
    updateFilter(id, checked);
  };

  return (
    <div class="my-2 py-2 flex items-center gap-1 whitespace-nowrap w-full overflow-x-auto overflow-y-visible">
      <div>{label}</div>
      <div class="flex flex-1 gap-2">
        {Object.keys(filterMap).map((type) => (
          <label class="whitespace-nowrap shrink-0">
            <input class="peer sr-only" type='checkbox' onChange={(e) => handleFilter(e, type)} />
            <span
              class={[
                'min-w-8',
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
                'cursor-pointer',
                'peer-checked:bg-blue-600',
                'peer-checked:text-white',
                'peer-checked:border-blue-400',
                'box-border'
              ].join(' ')}
            >{filterMap[type]}</span>
          </label>
        ))}
      </div>
    </div>
  )
};
