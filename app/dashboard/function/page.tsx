export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Function</h1>
      <p className="text-gray-600">
        Here we can onn/off function.
      </p>

      {/* Пример настроек */}
      <div className="mt-8">
        <div className="bg-yellow-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Basic function</h2>
          <ul className="mt-4 space-y-2">
            <li className="text-black">One</li>

          </ul>
        </div>
      </div>
    </div>
  );
}