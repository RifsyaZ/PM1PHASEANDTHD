// Configuration
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzLzDatUCJa86sgqfWywphXYDnL7GNFYrFlvV92Oy-XgThq87sKykq9TtOqVWWAucYP/exec";
const UPDATE_INTERVAL = 1000; // 1 second

// DOM Elements
const statusEl = document.getElementById('status');
const voltageDL1El = document.getElementById('voltage-dl1');
const voltageDL2El = document.getElementById('voltage-dl2');
const frequencyDL1El = document.getElementById('frequency-dl1');
const frequencyDL2El = document.getElementById('frequency-dl2');
const aedValueEl = document.getElementById('aed-value');
const tempDL1El = document.getElementById('temp-dl1');
const humidityDL1El = document.getElementById('humidity-dl1');
const tempDL2El = document.getElementById('temp-dl2');
const humidityDL2El = document.getElementById('humidity-dl2');

// Chart and Gauge instances
let voltageChart;
let aedGauge;

// Initialize the dashboard
async function initDashboard() {
    setupVoltageChart();
    setupAEDGauge();
    await loadData();
    setInterval(loadData, UPDATE_INTERVAL);
}

// Setup the voltage chart
function setupVoltageChart() {
    const ctx = document.getElementById('voltageChart').getContext('2d');
    voltageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'DL1 Voltage (V)',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'DL2 Voltage (V)',
                    data: [],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Voltage (V)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Setup the AED gauge
function setupAEDGauge() {
    const opts = {
        angle: 0,
        lineWidth: 0.2,
        radiusScale: 1,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#6AD6EC',
        colorStop: '#3A7BD5',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
        staticZones: [
            {strokeStyle: "#30B32D", min: 0, max: 5},
            {strokeStyle: "#FFDD00", min: 5, max: 10},
            {strokeStyle: "#F03E3E", min: 10, max: 100}
        ],
        staticLabels: {
            font: "10px sans-serif",
            labels: [0, 5, 10, 20, 50, 100],
            color: "#000000",
            fractionDigits: 0
        },
    };
    
    const target = document.getElementById('aedGauge');
    aedGauge = new Gauge(target).setOptions(opts);
    aedGauge.maxValue = 100;
    aedGauge.setMinValue(0);
    aedGauge.animationSpeed = 32;
    aedGauge.set(0);
}

// Load data from Google Sheets
async function loadData() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();

        if (!data || data.length === 0) {
            statusEl.textContent = "No data available";
            return;
        }

        // Get the most recent data
        const latestData = data[data.length - 1];
        const recentData = data.slice(-20); // Last 20 readings for the chart

        // Update the UI with the latest values
        updateDisplayValues(latestData);
        
        // Update the chart with recent data
        updateVoltageChart(recentData);

        statusEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('Error loading data:', error);
        statusEl.textContent = "Error loading data";
        statusEl.style.color = "red";
    }
}

// Update the display values with the latest data
function updateDisplayValues(data) {
    voltageDL1El.textContent = `${parseFloat(data.V1).toFixed(2)} V`;
    voltageDL2El.textContent = `${parseFloat(data.V2).toFixed(2)} V`;
    frequencyDL1El.textContent = `${parseFloat(data.Freq1).toFixed(2)} Hz`;
    frequencyDL2El.textContent = `${parseFloat(data.Freq2).toFixed(2)} Hz`;
    aedValueEl.textContent = `${parseFloat(data.AED1).toFixed(6)} A`;
    tempDL1El.textContent = `${parseFloat(data.Tem1).toFixed(1)} °C`;
    humidityDL1El.textContent = `${parseFloat(data.Humidity1).toFixed(1)} %`;
    tempDL2El.textContent = `${parseFloat(data.Tem2).toFixed(1)} °C`;
    humidityDL2El.textContent = `${parseFloat(data.Humidity2).toFixed(1)} %`;
    
    // Update the gauge
    const aedValue = parseFloat(data.AED1);
    aedGauge.set(aedValue > 100 ? 100 : aedValue);
}

// Update the voltage chart with recent data
function updateVoltageChart(dataArray) {
    const labels = dataArray.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleTimeString();
    });
    
    const v1Data = dataArray.map(item => parseFloat(item.V1));
    const v2Data = dataArray.map(item => parseFloat(item.V2));
    
    voltageChart.data.labels = labels;
    voltageChart.data.datasets[0].data = v1Data;
    voltageChart.data.datasets[1].data = v2Data;
    voltageChart.update();
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initDashboard);