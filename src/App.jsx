import React, { useState, useEffect } from 'react';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('aero-tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Burun konisi bulkhead mukavemet analizi', status: 'todo' },
      { id: 2, title: 'El elyaf kompozit üretim testi', status: 'in-progress' },
      { id: 3, title: 'Aerodinamik fin profili simülasyonu', status: 'done' }
    ];
  });

  const [newTask, setNewTask] = useState('');
  const [daysLeft, setDaysLeft] = useState(24);

  useEffect(() => {
    localStorage.setItem('aero-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask, status: 'todo' }]);
    setNewTask('');
  };

  const moveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      {/* Üst Başlık & Sayaç */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #334155',
        paddingBottom: '1rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#38bdf8', fontSize: '1.8rem' }}>🚀 AeroSpace Proje Asistanı</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Yarışma & Mühendislik Takım Paneli
          </p>
        </div>
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}>
          ⏳ KTR Teslimine: {daysLeft} Gün
        </div>
      </header>

      {/* Ana Gövde */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1.5rem' }}>
        
        {/* Sol Kolon: Kanban Tahtası */}
        <div>
          {/* Görev Ekleme Formu */}
          <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Yeni görev veya revizyon ekle..."
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#fff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
            <button type="submit" style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Ekle
            </button>
          </form>

          {/* Kanban Sütunları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { id: 'todo', title: '📌 Yapılacaklar', color: '#f59e0b' },
              { id: 'in-progress', title: '⚙️ Devam Edenler', color: '#3b82f6' },
              { id: 'done', title: '✅ Tamamlananlar', color: '#10b981' }
            ].map(col => (
              <div key={col.id} style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: col.color, fontSize: '1rem' }}>{col.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {tasks.filter(t => t.status === col.id).map(task => (
                    <div key={task.id} style={{
                      backgroundColor: '#334155',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem'
                    }}>
                      <p style={{ margin: '0 0 0.75rem 0', lineHeight: '1.4' }}>{task.title}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {col.id !== 'todo' && (
                            <button onClick={() => moveTask(task.id, col.id === 'done' ? 'in-progress' : 'todo')} style={{
                              backgroundColor: '#475569', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '0.25rem'
                            }}>← Geri</button>
                          )}
                          {col.id !== 'done' && (
                            <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'in-progress' : 'done')} style={{
                              backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'
                            }}>İleri →</button>
                          )}
                        </div>
                        <button onClick={() => deleteTask(task.id)} style={{
                          backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.8rem'
                        }}>Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Kolon: Kaynaklar Havuzu */}
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '1.25rem',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1.1rem' }}>📁 Doküman Havuzu</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <li style={{ padding: '0.5rem', backgroundColor: '#334155', borderRadius: '6px', cursor: 'pointer' }}>
              📄 TEKNOFEST KTR Şablonu.pdf
            </li>
            <li style={{ padding: '0.5rem', backgroundColor: '#334155', borderRadius: '6px', cursor: 'pointer' }}>
              📊 OpenRocket Uçuş Verileri.ork
            </li>
            <li style={{ padding: '0.5rem', backgroundColor: '#334155', borderRadius: '6px', cursor: 'pointer' }}>
              🔗 Dernek Teknik Rapor Arşivi
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}