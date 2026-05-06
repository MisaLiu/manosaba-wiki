import { useState } from 'preact/hooks';
import { Drawer } from './Drawer';
import { TitleBar } from './TitleBar';
import { Footer } from './Footer';
import type { ComponentChildren } from 'preact';

type AppShellProps = {
  children: ComponentChildren,
};

export const AppShell = ({
  children,
}: AppShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(open => !open);
  };

  return (
    <div class="min-h-screen bg-zinc-950 text-zinc-100">
      <TitleBar onMenuToggle={toggleDrawer} />
      <Drawer open={drawerOpen} onNavigate={closeDrawer} />

      <button
        type="button"
        class={[
          'fixed',
          'inset-0',
          'top-14',
          'z-35',
          'bg-black/50',
          'transition-opacity',
          'duration-200',
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          'md:hidden',
        ].join(' ')}
        onClick={closeDrawer}
        aria-label="Close navigation menu"
      />

      <main class="min-h-screen px-4 pb-6 pt-18 md:ml-64 md:px-6 md:pb-8 md:pt-18">
        {children}
      </main>

      <Footer />
    </div>
  );
};
