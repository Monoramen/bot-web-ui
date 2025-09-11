import { Card, CardContent } from "@/components/ui/card";

export default function LogsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Журнал событий</h1>
      <Card>
        <CardContent>
          <p className="text-gray-500">Здесь будет таблица логов...</p>
        </CardContent>
      </Card>
    </div>
  );
}
