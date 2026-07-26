"use client";

import { exportToExcel } from '@/lib/exportExcel';

interface ExportExcelButtonProps {
  data: Record<string, any>[];
  filename: string;
  sheetName?: string;
  buttonText?: string;
  style?: React.CSSProperties;
}

export function ExportExcelButton({
  data,
  filename,
  sheetName = 'Reporte',
  buttonText = '📊 Exportar Excel',
  style
}: ExportExcelButtonProps) {
  const handleExport = () => {
    exportToExcel(data, filename, sheetName);
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-gold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.85rem',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        ...style
      }}
      title="Descargar reporte en formato Excel (.xlsx)"
    >
      {buttonText}
    </button>
  );
}
