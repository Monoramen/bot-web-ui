import { title, subtitle } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen flex flex-col p-6">
      {/* Контейнер с ограниченной шириной и центрированием */}
      <div className="max-w-4xl mx-auto w-full">
        {/* Заголовок страницы */}
        <h1 className={title()}>О конструкторе бота</h1>
        <p className={subtitle()}>Узнайте больше о нашем конструкторе Telegram-ботов</p>

        {/* Основной контент */}
        <div className="mt-8 space-y-6">
          {/* Секция "Что это?" */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Что это?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Наш конструктор ботов — это мощный инструмент для создания Telegram-ботов без необходимости написания кода. 
              Вы можете легко настраивать команды, клавиатуры, прикрепления и многое другое.
            </p>
          </section>

          {/* Секция "Преимущества" */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Преимущества</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              <li>Простота использования: интерфейс понятен даже новичкам.</li>
              <li>Гибкость: настройте бота под свои нужды.</li>
              <li>Интеграция: поддерживаются различные типы прикреплений (аудио, видео, документы и т.д.).</li>
              <li>Статистика: отслеживайте активность бота и пользователей.</li>
            </ul>
          </section>

          {/* Секция "Как это работает?" */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Как это работает?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Создайте бота за несколько шагов:
            </p>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400">
              <li>Зарегистрируйтесь в системе.</li>
              <li>Создайте нового бота и настройте его параметры.</li>
              <li>Добавьте команды и прикрепления через интуитивно понятный интерфейс.</li>
              <li>Опубликуйте бота и начните использовать его в Telegram.</li>
            </ol>
          </section>

          {/* Секция "Примеры использования" */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Примеры использования</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Поддержка клиентов</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Автоматизируйте ответы на часто задаваемые вопросы.
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Онлайн-магазин</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Создайте бота для приема заказов и управления каталогом.
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Образование</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Используйте бота для проведения тестов и обучения.
                </p>
              </div>
            </div>
          </section>

          {/* Призыв к действию */}
          <section className="text-center mt-8">
            <h2 className="text-2xl font-bold mb-4">Начните прямо сейчас!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Создайте своего первого бота за несколько минут.
            </p>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Создать бота
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}