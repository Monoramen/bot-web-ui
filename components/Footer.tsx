// src/components/Footer.tsx
'use client';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-border/30">
<div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
  Сделано с <Heart className="h-4 w-4 text-red-500 fill-red-500" /> 
  <span className="font-medium text-primary">Monoramen</span>
</div>
    </footer>
  );
}