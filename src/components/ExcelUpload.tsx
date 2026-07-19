"use client";

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  role: 'worker' | 'resident';
  onSuccess: () => void;
}

export function ExcelUpload({ role, onSuccess }: ExcelUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (data.length === 0) {
          throw new Error("El archivo Excel está vacío");
        }

        // Validate basic columns based on role
        if (!data[0].hasOwnProperty('email') || !data[0].hasOwnProperty('name')) {
            throw new Error("El Excel debe contener las columnas 'email' y 'name'");
        }

        // Post to API
        const response = await fetch('/api/users/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: data, role })
        });

        if (!response.ok) {
          const resError = await response.json();
          throw new Error(resError.error || "Fallo al importar usuarios");
        }

        alert(`¡Se importaron ${data.length} usuarios con éxito! La contraseña por defecto es 'password123'.`);
        onSuccess();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setError("Error al leer el archivo");
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input 
        type="file" 
        accept=".xlsx, .xls, .csv" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button 
        className="btn btn-outline" 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? 'Importando...' : '📥 Importar desde Excel'}
      </button>
      {error && <span style={{ color: 'var(--error)', fontSize: '0.875rem' }}>{error}</span>}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Formato: email, name, phone, {role === 'worker' ? 'workerType' : 'apartment'}</p>
    </div>
  );
}
