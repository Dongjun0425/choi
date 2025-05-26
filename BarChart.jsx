// src/components/BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BarChart = ({ title, data, labels }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: '#4caf50',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  return <Bar options={options} data={chartData} />;
};

export default BarChart;
