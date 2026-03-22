import { Outlet } from 'react-router-dom';

import { RouteViewportManager } from '@/shared/lib/navigation/RouteViewportManager';
import { Footer } from '@/shared/ui/footer';
import { Header } from '@/shared/ui/header';

export function Layout() {
  return (
    <div>
      <RouteViewportManager />
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}