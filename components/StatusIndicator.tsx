// src/components/dashboard/StatusIndicator.tsx

'use client';

import { cn } from "@/lib/utils"; // если используешь shadcn — иначе убери cn

interface StatusIndicatorProps {
  isRunning: boolean;
  isCritical: boolean;
  statusText: string;
}

export default function StatusIndicator({ isRunning, isCritical, statusText }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3 bg-muted/40 px-4 py-2.5 rounded-full border border-muted">
      <div 
        className={cn(
          "w-5 h-5 rounded-full shadow-md",
          isRunning 
            ? "bg-green-500 animate-pulse" 
            : isCritical 
              ? "bg-red-500 animate-pulse" 
              : "bg-primary"
        )}
      />
      <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
        {statusText}
      </h2>
    </div>
  );
}