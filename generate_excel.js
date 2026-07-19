const XLSX = require('xlsx');
const fs = require('fs');

const workersData = [
  { name: 'Juan Perez', email: 'juan@example.com', phone: '555-1001', workerType: 'Security' },
  { name: 'Maria Gomez', email: 'maria@example.com', phone: '555-1002', workerType: 'Cleaner' },
  { name: 'Carlos Ruiz', email: 'carlos@example.com', phone: '555-1003', workerType: 'Gardener' }
];

const residentsData = [
  { name: 'Familia Lopez', email: 'lopez@example.com', phone: '555-2001', apartment: 'Apt 101' },
  { name: 'Ana Martinez', email: 'ana@example.com', phone: '555-2002', apartment: 'Apt 102' }
];

// Create Workers Workbook
const wbWorkers = XLSX.utils.book_new();
const wsWorkers = XLSX.utils.json_to_sheet(workersData);
XLSX.utils.book_append_sheet(wbWorkers, wsWorkers, 'Workers');
XLSX.writeFile(wbWorkers, 'test_workers.xlsx');

// Create Residents Workbook
const wbResidents = XLSX.utils.book_new();
const wsResidents = XLSX.utils.json_to_sheet(residentsData);
XLSX.utils.book_append_sheet(wbResidents, wsResidents, 'Residents');
XLSX.writeFile(wbResidents, 'test_residents.xlsx');

console.log('Excel files created successfully!');
