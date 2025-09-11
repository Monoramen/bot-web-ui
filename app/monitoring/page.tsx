import { Card, CardContent } from "@/components/ui/card";
import TemperatureChart from "@/components/TemperatureChart";

export default function MonitoringPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Мониторинг</h1>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">График температуры</h2>
          <TemperatureChart />
        </CardContent>
      </Card>
    </div>
  );
}
