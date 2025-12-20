const fs = require('fs');
const dataset = require('./dataset.js'); // adjust path if needed

const csvHeader = 'id,type,location,date,time,latitude,longitude,description,status\n';

const csvRows = dataset.map(item => {
    return [
        item.id,
        `"${item.type}"`,
        `"${item.location}"`,
        `"${item.date.split('-').reverse().join('-')}"`, // convert DD-MM-YYYY -> YYYY-MM-DD
        item.time || '',
        item.latitude,
        item.longitude,
        `"${item.description}"`,
        `"${item.status}"`
    ].join(',');
});

fs.writeFileSync('crime_data.csv', csvHeader + csvRows.join('\n'));
console.log('CSV file created: crime_data.csv');
