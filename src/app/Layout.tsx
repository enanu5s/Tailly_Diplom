// src/app/Layout.tsx
import { Outlet } from 'react-router-dom';

import { Footer } from '@/shared/ui/footer';
import { Header } from '@/shared/ui/header';

export function Layout() {
  return (
    <div>
      <Header />

      <main>
        <Outlet />   {/* здесь будут рендериться все страницы */}
      </main>

      <Footer />
    </div>
  );
};