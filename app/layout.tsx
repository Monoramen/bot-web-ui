'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  // Добавляем или убираем класс dark на html
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  return (
    <html lang="en">
      <body className={`${inter.className} transition-colors duration-300`}>
        <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
        <main className="p-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
