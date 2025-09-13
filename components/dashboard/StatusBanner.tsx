'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StatusBannerProps {
  isCritical: boolean;
}

const StatusBanner = ({ isCritical }: StatusBannerProps) => {
    if (!isCritical) return null;

    return (
        <Alert variant="destructive" className="mb-6 animate-pulse border-red-500">
            <AlertTitle>КРИТИЧЕСКАЯ АВАРИЯ!</AlertTitle>
            <AlertDescription>
                Немедленно проверьте печь. Работа остановлена.
            </AlertDescription>
        </Alert>
    );
};

export default StatusBanner;