// src/components/dashboard/RecentFiringsCard.tsx

'use client';

import { Card, CardContent } from "@/components/ui/card";
import RecentFiringsLoader from '@/components/dashboard/RecentFiringLoader';
import RecentFiringsEmpty from '@/components/dashboard/RecentFiringEmpty';
import RecentFiringsError from '@/components/dashboard/RecentFiringError';
import FiringItem from '@/components/dashboard/FiringItem';
import { useRecentFirings } from '@/hooks/useRecentFirings';
import { FiringSession } from "@/types/session";

interface RecentFiringsCardProps {
  openFiringDetails: (firing: FiringSession) => void;
}

export default function RecentFiringsCard({ openFiringDetails }: RecentFiringsCardProps) {
  const { recentFirings, loading, error } = useRecentFirings();

  return (
    <div>
        {loading && <RecentFiringsLoader />}
        {error && <RecentFiringsError message={error} />}
        {!loading && !error && recentFirings.length === 0 && <RecentFiringsEmpty />}
        {!loading && !error && recentFirings.length > 0 && (
          <div className="space-y-3">
            {recentFirings.map(firing => (
      <FiringItem 
        key={firing.id} 
        firing={firing} 
        onClick={() => openFiringDetails(firing)} 
      />
            ))}
          </div>
        )}
</div>
  );
}