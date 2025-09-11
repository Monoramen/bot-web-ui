'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image'
const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/programs', label: 'Программы' },
  { href: '/monitoring', label: 'Мониторинг' },
  { href: '/settings', label: 'Настройки' },
];

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Navbar({ isDark, toggleTheme }: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative bg-sidebar text-sidebar-foreground shadow transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
            <Link href="/" className="flex items-center space-x-2">
              {/* Иконка вместо смайлика */}
              <Image
                src="/favicon.ico" // путь к иконке в public/
                alt="ТРМ-251"
                width={44}
                height={44}
              />
              <span className="text-2xl font-bold text-primary">ТРМ-251</span>
            </Link>


          {/* Десктоп ссылки */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300
                  ${pathname === item.href 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-primary hover:text-primary-foreground text-foreground'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Переключение темы */}
            <button
              onClick={toggleTheme}
              className="ml-4 p-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Мобильное меню */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-primary/20 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300
                ${pathname === item.href 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
            >
              {item.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="mt-2 w-full flex items-center justify-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="ml-2 text-sm">Сменить тему</span>
          </button>
        </div>
      )}
    </nav>
  );
}
