import { Chart, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import type { SkillScore } from './api';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

let chartInstance: Chart | null = null;

export function renderRadarChart(canvas: HTMLCanvasElement, skills: SkillScore[]): void {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const labels = skills.map(s => s.name);
  const scores = skills.map(s => s.score);

  chartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Skill Score',
        data: scores,
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderColor: 'rgba(147, 51, 234, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: scores.map(s =>
          s >= 80 ? '#059669' : s >= 60 ? '#d97706' : '#e11d48'
        ),
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#0f172a',
          bodyColor: '#475569',
          titleFont: { family: 'Inter', size: 12, weight: '600' },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.r}/100`,
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: 'rgba(71, 85, 105, 0.5)',
            backdropColor: 'transparent',
            font: { family: 'JetBrains Mono', size: 9 },
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.06)',
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.08)',
          },
          pointLabels: {
            color: '#475569',
            font: { family: 'Inter', size: 11, weight: '600' },
          },
        },
      },
    },
  });
}
