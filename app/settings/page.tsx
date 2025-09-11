import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>
      <Card>
        <CardContent>
          <p className="text-gray-500 mb-4">Здесь будут системные параметры.</p>
          <Button>Сохранить изменения</Button>
        </CardContent>
      </Card>
    </div>
  );
}
