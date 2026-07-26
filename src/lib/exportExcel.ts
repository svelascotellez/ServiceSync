import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel (.xlsx) file from an array of objects.
 * Applies auto-column widths for a clean presentation.
 */
export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Reporte') {
  if (!data || data.length === 0) {
    alert('No hay datos disponibles para exportar.');
    return;
  }

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Calculate auto column widths
  const objectKeys = Object.keys(data[0]);
  const columnWidths = objectKeys.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const valStr = row[key] ? String(row[key]) : '';
      if (valStr.length > maxLen) {
        maxLen = valStr.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
  });

  worksheet['!cols'] = columnWidths;

  // Create workbook & append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}
