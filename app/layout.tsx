// src/app/layout.tsx
'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Footer from '@/components/Footer'; // ✅ Импортируем футер

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  return (
    <html lang="en">
      <body className={`${inter.className} transition-colors duration-300 flex flex-col min-h-screen`}>
        <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
        <main className="flex-1 p-6">{children}</main> {/* ✅ flex-1 чтобы footer прилип к низу */}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}