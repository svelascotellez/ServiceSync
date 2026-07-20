"use client";

import { useState, useEffect, useRef } from 'react';

export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !photoUrl) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, photoUrl }),
      });
      if (res.ok) {
        setNewComment('');
        setPhotoUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchComments();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '2px solid var(--border)', paddingTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Comentarios</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>No hay comentarios aún.</div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--primary)' }}>{c.user?.name} ({c.user?.role})</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              {c.text && <p style={{ fontSize: '0.9rem', marginBottom: c.photoUrl ? '0.5rem' : '0' }}>{c.text}</p>}
              {c.photoUrl && (
                <img src={c.photoUrl} alt="Adjunto" style={{ maxWidth: '100%', borderRadius: '0.25rem', maxHeight: '200px', objectFit: 'cover' }} />
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea 
          rows={2} 
          className="input-field" 
          placeholder="Escribe un comentario..." 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
        />
        
        {photoUrl && (
          <div style={{ position: 'relative', display: 'inline-block', width: 'max-content' }}>
            <img src={photoUrl} alt="Preview" style={{ height: '80px', borderRadius: '0.25rem' }} />
            <button type="button" onClick={() => setPhotoUrl(null)} style={{ position: 'absolute', top: -5, right: -5, background: 'var(--error)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} ref={fileInputRef} />
            📷 Adjuntar Foto
          </label>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
