"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface EditUserModalProps {
  role: 'worker' | 'resident' | 'admin' | 'supervisor';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: any;
}

export function EditUserModal({ role, isOpen, onClose, onSuccess, initialData }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // optional on edit
    phone: '',
    workerType: '',
    apartment: '',
    photoUrl: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [workerTypes, setWorkerTypes] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    setMounted(true);
    if (role === 'worker') {
      fetch('/api/worker-types')
        .then(res => res.json())
        .then(data => {
          if (data.workerTypes) setWorkerTypes(data.workerTypes);
        })
        .catch(console.error);
    }
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // do not prepopulate password
        phone: initialData.phone || '',
        workerType: initialData.workerType || '',
        apartment: initialData.apartment || '',
        photoUrl: initialData.photoUrl || '',
      });
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
    }
  }, [isOpen, initialData, role]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '500px', backgroundColor: 'var(--surface)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          Editar {role === 'worker' ? 'Trabajador' : role === 'resident' ? 'Residente' : role === 'supervisor' ? 'Supervisor' : 'Administrador'}
        </h2>
        
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem', padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {role === 'worker' && (
            <div className="input-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>Foto</span>
                )}
              </div>
              <label className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                {uploading ? 'Subiendo...' : 'Subir Foto'}
                <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const form = new FormData();
                  form.append('file', file);
                  try {
                    const res = await fetch('/api/upload', { method: 'POST', body: form });
                    const data = await res.json();
                    if (res.ok) setFormData({...formData, photoUrl: data.url});
                  } finally {
                    setUploading(false);
                  }
                }} />
              </label>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Nombre Completo</label>
            <input required type="text" className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <input required type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="input-group">
            <label className="input-label">Nueva Contraseña (Opcional)</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Déjalo en blanco para mantener la actual" 
                className="input-field" 
                style={{ paddingRight: '2.5rem', width: '100%' }}
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
                }}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {formData.password.length > 0 && (
            <div className="input-group">
              <label className="input-label">Confirmar Nueva Contraseña</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  required
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Repite la nueva contraseña" 
                  className="input-field" 
                  style={{ paddingRight: '2.5rem', width: '100%' }}
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                  }}
                  title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {confirmPassword.length > 0 && formData.password !== confirmPassword && (
                <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  ⚠️ Las contraseñas no coinciden
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Teléfono (opcional)</label>
            <input type="text" className="input-field" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>

          {role === 'worker' && (
            <div className="input-group">
              <label className="input-label">Tipo de Trabajador</label>
              <select required className="input-field" value={formData.workerType} onChange={(e) => setFormData({...formData, workerType: e.target.value})}>
                <option value="">Selecciona uno...</option>
                {workerTypes.map(wt => (
                  <option key={wt.id} value={wt.name}>{wt.name}</option>
                ))}
              </select>
            </div>
          )}

          {role === 'resident' && (
            <div className="input-group">
              <label className="input-label">Unidad / Apartamento</label>
              <input required type="text" className="input-field" placeholder="Ej. Apt 4B" value={formData.apartment} onChange={(e) => setFormData({...formData, apartment: e.target.value})} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={loading || (formData.password.length > 0 && formData.password !== confirmPassword)} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
