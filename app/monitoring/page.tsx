import { Card, CardContent } from "@/components/ui/card";



export default function MonitoringPage() {


  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Мониторинг</h1>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">График температуры</h2>

        </CardContent>
      </Card>
    </div>
  );
}
