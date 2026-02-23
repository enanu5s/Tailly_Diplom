// src/app/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/ui/header';
import { Footer } from '@/shared/ui/footer';

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