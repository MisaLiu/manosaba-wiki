import { Link, useLocation } from 'wouter-preact';

type DrawerProps = {
  open: boolean,
  onNavigate: () => void,
};

const navItems = [
  {
    label: '物品',
    href: '/item',
    match: (path: string) => path === '/' || path.startsWith('/item'),
  },
  {
    label: '配方',
    href: '/recipe',
    match: (path: string) => path.startsWith('/recipe'),
  },
];

export const Drawer = ({
  open,
  onNavigate,
}: DrawerProps) => {
  const [location] = useLocation();

  return (
    <aside
      class={[
        'fixed',
        'left-0',
        'top-14',
        'bottom-0',
        'z-40',
        'w-64',
        'border-r',
        'border-zinc-800',
        'bg-zinc-950',
        'px-3',
        'py-4',
        'transition-transform',
        'duration-200',
        'ease-out',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0',
      ].join(' ')}
    >
      <nav class="flex flex-col gap-2">
        {navItems.map((item) => {
          const active = item.match(location);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              class={[
                'flex',
                'items-center',
                'rounded-xl',
                'px-3',
                'py-2.5',
                'text-sm',
                'transition',
                active
                  ? 'bg-blue-500/15 text-blue-200 ring-1 ring-inset ring-blue-400/30'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100',
              ].join(' ')}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
