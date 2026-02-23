// src/pages/home/ui/HomePage.tsx
import type { FC } from 'react';

export const HomePage: FC = () => {
  return (
    <div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#4f46e5' }}>
        Добро пожаловать в Tailly 🐾
      </h1>
      
      <p style={{ fontSize: '1.4rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Уход за питомцами рядом с вами — груминг, выгул, передержка и многое другое
      </p>
    </div>
  );
};