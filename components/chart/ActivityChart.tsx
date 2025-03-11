import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ActivityChart = ({ data, options, type = 'bar' }) => {
  // Выбираем тип графика (Bar или Line)
  const ChartComponent = type === 'line' ? Line : Bar;

  return <ChartComponent data={data} options={options} />;
};

export default ActivityChart;