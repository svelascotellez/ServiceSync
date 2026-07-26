"use client";

import { useState, useRef, useEffect } from 'react';

interface ExcelColumnHeaderProps {
  title: string;
  columnKey: string;
  uniqueValues: string[];
  selectedValues: string[]; // empty or all values = no filter active
  onFilterChange: (newSelected: string[]) => void;
  currentSort: { column: string; order: 'asc' | 'desc' } | null;
  onSortChange: (column: string, order: 'asc' | 'desc') => void;
  displayFormatter?: (val: string) => string;
  style?: React.CSSProperties;
}

export function ExcelColumnHeader({
  title,
  columnKey,
  uniqueValues,
  selectedValues,
  onFilterChange,
  currentSort,
  onSortChange,
  displayFormatter,
  style
}: ExcelColumnHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSortedThisColumn = currentSort?.column === columnKey;
  const sortOrder = isSortedThisColumn ? currentSort.order : null;

  const isFilteredThisColumn = selectedValues.length > 0 && selectedValues.length < uniqueValues.length;

  // Initialize temp state when popup opens
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      setTempSelected(selectedValues.length === 0 ? [...uniqueValues] : [...selectedValues]);
      setSearchQuery('');
    }
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const visibleValues = uniqueValues.filter(val => {
    const display = displayFormatter ? displayFormatter(val) : val;
    return display.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isAllVisibleSelected = visibleValues.length > 0 && visibleValues.every(val => tempSelected.includes(val));

  const toggleSelectAll = () => {
    if (isAllVisibleSelected) {
      // Unselect visible
      setTempSelected(prev => prev.filter(v => !visibleValues.includes(v)));
    } else {
      // Select all visible
      const newSel = new Set([...tempSelected, ...visibleValues]);
      setTempSelected(Array.from(newSel));
    }
  };

  const toggleValue = (val: string) => {
    if (tempSelected.includes(val)) {
      setTempSelected(tempSelected.filter(v => v !== val));
    } else {
      setTempSelected([...tempSelected, val]);
    }
  };

  const handleApply = () => {
    if (tempSelected.length === uniqueValues.length || tempSelected.length === 0) {
      onFilterChange([]); // reset / clear
    } else {
      onFilterChange(tempSelected);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    onFilterChange([]);
    setTempSelected([...uniqueValues]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', userSelect: 'none', ...style }}>
      <span style={{ fontWeight: 700, cursor: 'pointer', flex: 1 }} onClick={() => onSortChange(columnKey, sortOrder === 'asc' ? 'desc' : 'asc')}>
        {title} {sortOrder === 'asc' ? '⬆️' : sortOrder === 'desc' ? '⬇️' : ''}
      </span>

      {/* Excel Dropdown Filter Arrow Button */}
      <button
        onClick={handleOpen}
        type="button"
        style={{
          background: isFilteredThisColumn ? '#C5A059' : 'rgba(255, 255, 255, 0.15)',
          color: isFilteredThisColumn ? '#081C2C' : 'var(--text-primary)',
          border: isFilteredThisColumn ? '1px solid #C5A059' : '1px solid var(--border)',
          borderRadius: '4px',
          padding: '0.2rem 0.4rem',
          fontSize: '0.75rem',
          cursor: 'pointer',
          marginLeft: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          transition: 'all 0.2s ease',
          fontWeight: 'bold'
        }}
        title={`Filtro de Excel para ${title}`}
      >
        {isFilteredThisColumn ? '🔍' : '▼'}
      </button>

      {/* Excel Popup Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 9999,
            width: '280px',
            backgroundColor: '#111C24',
            border: '1px solid #2B3A48',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            padding: '0.75rem',
            color: '#E2E8F0',
            fontSize: '0.85rem',
            fontFamily: 'inherit'
          }}
        >
          {/* Sorting Commands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => { onSortChange(columnKey, 'asc'); setIsOpen(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: sortOrder === 'asc' ? '#C5A059' : '#E2E8F0',
                textAlign: 'left',
                padding: '0.4rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: sortOrder === 'asc' ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🔤</span> Ordenar A a Z (Ascendente)
            </button>

            <button
              onClick={() => { onSortChange(columnKey, 'desc'); setIsOpen(false); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: sortOrder === 'desc' ? '#C5A059' : '#E2E8F0',
                textAlign: 'left',
                padding: '0.4rem 0.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: sortOrder === 'desc' ? 'bold' : 'normal'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🔠</span> Ordenar Z a A (Descendente)
            </button>
          </div>

          {/* Clear Filter Command */}
          <div style={{ borderTop: '1px solid #2B3A48', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              disabled={!isFilteredThisColumn}
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: isFilteredThisColumn ? '#E53E3E' : '#64748B',
                textAlign: 'left',
                padding: '0.4rem 0.5rem',
                borderRadius: '4px',
                cursor: isFilteredThisColumn ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%'
              }}
              onMouseEnter={(e) => { if (isFilteredThisColumn) e.currentTarget.style.backgroundColor = 'rgba(229,62,62,0.15)'; }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <span>🧹</span> Borrar filtro de "{title}"
            </button>
          </div>

          {/* Search Box inside Popup */}
          <div style={{ borderTop: '1px solid #2B3A48', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                color: '#FFFFFF',
                borderRadius: '4px',
                padding: '0.35rem 0.5rem',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Checkboxes List */}
          <div style={{
            maxHeight: '160px',
            overflowY: 'auto',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '0.4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
            marginBottom: '0.75rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer' }}
              />
              (Seleccionar todo)
            </label>

            <div style={{ height: '1px', backgroundColor: '#334155', margin: '0.2rem 0' }} />

            {visibleValues.map(val => {
              const isChecked = tempSelected.includes(val);
              const label = displayFormatter ? displayFormatter(val) : val;
              return (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleValue(val)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{label || '(Vacio)'}</span>
                </label>
              );
            })}

            {visibleValues.length === 0 && (
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center', padding: '0.5rem' }}>
                Sin coincidencias
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#94A3B8',
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                backgroundColor: '#C5A059',
                border: 'none',
                color: '#081C2C',
                fontWeight: 700,
                padding: '0.3rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
