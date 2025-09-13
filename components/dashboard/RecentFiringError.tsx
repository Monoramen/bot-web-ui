// src/components/dashboard/RecentFiringsError.tsx

interface RecentFiringsErrorProps {
  message: string;
}

export default function RecentFiringsError({ message }: RecentFiringsErrorProps) {
  return (
    <div className="py-8 text-center text-red-500">
      {message}
    </div>
  );
}