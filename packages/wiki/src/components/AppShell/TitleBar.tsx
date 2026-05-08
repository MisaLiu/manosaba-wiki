type TitleBarProps = {
  onMenuToggle: () => void,
};

export const TitleBar = ({
  onMenuToggle,
}: TitleBarProps) => {
  return (
    <header class="fixed inset-x-0 top-0 z-30 h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div class="flex h-full items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 md:hidden"
          onClick={onMenuToggle}
          aria-label="Open navigation menu"
        >
          <span class="text-lg leading-none">☰</span>
        </button>

        <div class="min-w-0">
          <div class="truncate text-lg font-semibold text-zinc-100">Manosaba Wiki</div>
        </div>
      </div>
    </header>
  );
};
