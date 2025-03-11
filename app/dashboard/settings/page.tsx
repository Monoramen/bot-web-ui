export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Настройки</h1>
      <p className="text-gray-600">
        Здесь вы можете настроить параметры вашего бота.
      </p>

      {/* Пример настроек */}
      <div className="mt-8">
        <div className="bg-yellow-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Основные настройки</h2>
          <ul className="mt-4 space-y-2">
            <li className="text-black">Язык: Русский</li>

          </ul>
        </div>
      </div>
    </div>
  );
}