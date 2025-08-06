const SHEET_URL = "https://script.google.com/macros/s/AKfycbzLzDatUCJa86sgqfWywphXYDnL7GNFYrFlvV92Oy-XgThq87sKykq9TtOqVWWAucYP/exec";

let voltageChart;
let thdGauge;

async function loadData() {
  try {
    const res = await fetch(SHEET_URL);
    const data = await res.json();

    if (!data || data.length === 0) {
      console.warn("Tidak ada data ditemukan.");
      return;
    }

    const recent = data.slice(-20);
    const latest = data[data.length - 1];

    updateChart(recent);
    updateGauge(latest);

  } catch (err) {
    console.error("Gagal mengambil data:", err);
  }
}

function updateChart(dataArray) {
  const labels = dataArray.map(item => item.timestamp);
  const v1 = dataArray.map(item => parseFloat(item.V1));
  const v2 = dataArray.map(item => parseFloat(item.V2));

  voltageChart.data.labels = labels;
  voltageChart.data.datasets[0].data = v1;
  voltageChart.data.datasets[1].data = v2;
  voltageChart.update();
}

function updateGauge(data) {
  const thd = parseFloat(data.AED1);
  if (thdGauge) thdGauge.set(thd);
}

function setupChart() {
  const ctx = document.getElementById("voltageChart").getContext("2d");
  voltageChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: "Voltage 1 (V)", borderColor: "blue", data: [], fill: false },
        { label: "Voltage 2 (V)", borderColor: "green", data: [], fill: false }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function setupGauge() {
  const opts = {
    angle: 0,
    lineWidth: 0.3,
    radiusScale: 0.9,
    pointer: {
      length: 0.6,
      strokeWidth: 0.04,
      color: "#000"
    },
    staticLabels: {
      font: "10px sans-serif",
      labels: [0, 25, 50, 75, 100],
      color: "#000",
      fractionDigits: 0
    },
    limitMax: false,
    limitMin: false,
    highDpiSupport: true
  };
  const target = document.getElementById('gauge');
  thdGauge = new Gauge(target).setOptions(opts);
  thdGauge.maxValue = 100;
  thdGauge.setMinValue(0);
  thdGauge.animationSpeed = 32;
  thdGauge.set(0);
}

window.onload = () => {
  setupChart();
  setupGauge();
  loadData();
  setInterval(loadData, 1000);
};
