function searchData() {
    const type = document.getElementById("crimeType").value;
    const status = document.getElementById("status").value;
    const severity = document.getElementById("severity").value;

    const data = [
    {id: 1, type: "Theft", location: "Pune", date: "2025-08-15 14:30", severity: "High", status: "Open"},
    {id: 2, type: "Fraud", location: "Mumbai", date: "2025-08-12 10:00", severity: "Medium", status: "Closed"},
    {id: 3, type: "Assault", location: "Delhi", date: "2025-08-10 19:45", severity: "Low", status: "Pending"}
    ];

    const filtered = data.filter(item =>
    (!type || item.type === type) &&
    (!status || item.status === status) &&
    (!severity || item.severity === severity)
    );

    const table = document.getElementById("resultTable");
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (filtered.length > 0) {
    filtered.forEach(item => {
        const row = `<tr>
        <td>${item.id}</td>
        <td>${item.type}</td>
        <td>${item.location}</td>
        <td>${item.date}</td>
        <td>${item.severity}</td>
        <td>${item.status}</td>
        <td><button onclick="alert('Viewing record ${item.id}')">View</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
    table.style.display = "table";
    } else {
        tbody.innerHTML = `<tr><td colspan="7">No records found</td></tr>`;
        table.style.display = "table";
    }
}

function clearFilters() {
    document.getElementById("crimeType").value = "";
    document.getElementById("status").value = "";
    document.getElementById("severity").value = "";
    document.getElementById("resultTable").style.display = "none";
}