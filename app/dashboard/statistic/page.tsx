"use client";
import React, { useState } from 'react';
import ActivityChart from '@/components/chart/ActivityChart';

export default function StatisticsPage() {
  // Состояние для выбора типа данных
  const [dataType, setDataType] = useState('temperature');

  // Данные для графика
  const getChartData = (type) => {
    switch (type) {
      case 'temperature':
        return {
          labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
          datasets: [
            {
              label: 'Температура (°C)',
              data: [15, 18, 22, 20, 16],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
      case 'users':
        return {
          labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          datasets: [
            {
              label: 'Количество пользователей',
              data: [120, 190, 80, 110, 150, 90, 200],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };
      case 'messages':
        return {
          labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          datasets: [
            {
              label: 'Количество сообщений',
              data: [300, 450, 200, 500, 600, 400, 700],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };
      default:
        return {
          labels: [],
          datasets: [],
        };
    }
  };

  // Настройки графика
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: dataType === 'temperature'
          ? 'Температура по времени'
          : dataType === 'users'
          ? 'Активность пользователей'
          : 'Количество сообщений',
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Statistic</h1>
      <p className="text-gray-600">
        Здесь вы можете просматривать статистику использования вашего бота.
      </p>

      {/* Кнопки для выбора типа данных */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => setDataType('temperature')}
          className={`px-4 py-2 rounded-lg ${
            dataType === 'temperature'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Температура
        </button>
        <button
          onClick={() => setDataType('users')}
          className={`px-4 py-2 rounded-lg ${
            dataType === 'users'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Пользователи
        </button>
        <button
          onClick={() => setDataType('messages')}
          className={`px-4 py-2 rounded-lg ${
            dataType === 'messages'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Сообщения
        </button>
      </div>

      {/* График */}
      <div className="mt-8">
        <div className="bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">
            {dataType === 'temperature'
              ? 'Температура по времени'
              : dataType === 'users'
              ? 'Активность пользователей'
              : 'Количество сообщений'}
          </h2>
          <div className="mt-4 h-64 bg-gray-400 rounded-lg flex items-center justify-center">
            <ActivityChart
              data={getChartData(dataType)}
              options={options}
              type={dataType === 'temperature' ? 'line' : 'bar'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}