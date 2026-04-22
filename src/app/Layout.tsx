import { Outlet } from 'react-router-dom';

import { ShopCartMergePrompt } from '@/features/shop';
import { RouteViewportManager } from '@/shared/lib/navigation/RouteViewportManager';
import { Footer } from '@/shared/ui/footer';
import { Header } from '@/shared/ui/header';
import { MockDataBadge } from '@/shared/ui/mock-data-badge/MockDataBadge';

export function Layout() {
  return (
    <div>
      <RouteViewportManager />
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
      <ShopCartMergePrompt />
      <MockDataBadge />
    </div>
  );
}
