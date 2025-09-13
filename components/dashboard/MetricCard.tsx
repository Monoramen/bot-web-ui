// src/components/dashboard/MetricCard.tsx

'use client';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  icon: string;
}

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div 
      className="bg-gradient-to-br from-muted/80 to-muted/40 p-4 rounded-xl border border-muted/50 
                 text-center flex flex-col items-center justify-center gap-2 
                 hover:scale-105 transition-transform duration-300 group"
    >
      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <span className="text-xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        {label}
      </div>
      <div className="text-xl md:text-2xl font-extrabold text-foreground leading-tight">
        {value}
      </div>
    </div>
  );
}