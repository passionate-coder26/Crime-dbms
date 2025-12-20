let crimesData = [];
let charts = {};


function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    if (crimesData.length > 0) {
        // Destroy old chart if exists
        if (charts[tabId]) {
            charts[tabId].destroy();
            charts[tabId] = null;
        }

        // Build chart fresh
        if (tabId === "chart1") buildCrimeTypeChart();
        if (tabId === "chart2") buildStatusChart();
        if (tabId === "chart3") buildLocationChart();
    }
}


Chart.defaults.color = 'white';


async function fetchCrimeData() {
    try {
        const res = await fetch("http://localhost:3000/api/crimes");
        crimesData = await res.json();
        console.log("Fetched crimes:", crimesData);

        showTab('chart1');
    } catch (err) {
        console.error("Error fetching crime data:", err);
    }
}


function buildCrimeTypeChart() {
    const typeCounts = {};
    crimesData.forEach(c => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });

    charts["chart1"] = new Chart(document.getElementById('crimeTypeChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{
                data: Object.values(typeCounts),
                backgroundColor: ['#ff4d4d', '#ff944d', '#4d79ff', '#33cc33', '#aa66cc']
            }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });
}

function buildStatusChart() {
    const statusCounts = {};
    crimesData.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    charts["chart2"] = new Chart(document.getElementById('statusChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Status Count',
                data: Object.values(statusCounts),
                backgroundColor: ['#33cc33', '#ff3333', '#ffaa00']
            }]
        },
        options: {
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                x: { ticks: { color: 'white' } },
                y: { ticks: { color: 'white' } }
            }
        }
    });
}

function buildLocationChart() {
    const locationCounts = {};
    crimesData.forEach(c => {
        locationCounts[c.location] = (locationCounts[c.location] || 0) + 1;
    });

    charts["chart3"] = new Chart(document.getElementById('locationChart').getContext('2d'), {
        type: 'line',
        data: {
            labels: Object.keys(locationCounts),
            datasets: [{
                label: 'Crimes',
                data: Object.values(locationCounts),
                borderColor: '#ff3333',
                backgroundColor: 'rgba(255,51,51,0.4)',
                fill: true  
            }]
        },
        options: {
            plugins: { legend: { labels: { color: 'white' } } },
            scales: {
                x: { ticks: { color: 'white' } },
                y: { ticks: { color: 'white' } }
            }
        }
    });
}

// Fetch data and load first chart
fetchCrimeData();
