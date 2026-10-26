import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Görev Yönetimi State'leri
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  // 1. Kullanıcı Oturum Durumunu Dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore'dan Canlı Görev Verilerini Çek
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(taskList);
    });

    return () => unsubscribe();
  }, [user]);

  // Kayıt ve Giriş İşlemleri
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError('Hata: ' + err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // Görev Ekleme (Firestore)
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    await addDoc(collection(db, 'tasks'), {
      title: newTask,
      status: 'todo',
      createdAt: Date.now(),
      createdBy: user.email
    });
    setNewTask('');
  };

  // Görev Durumu Değiştirme
  const moveTask = async (id, newStatus) => {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { status: newStatus });
  };

  // Görev Silme
  const deleteTask = async (id) => {
    const taskRef = doc(db, 'tasks', id);
    await deleteDoc(taskRef);
  };

  // --- EĞER GİRİŞ YAPILMADIYSA: GİRİŞ / KAYIT EKRANI ---
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', color: '#0ea5e9' }}>
            🚀 TEKNOFEST Asistan
          </h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {isRegistering ? 'Takıma Katılmak İçin Kaydol' : 'Takım Paneline Giriş Yap'}
          </p>

          {error && (
            <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>E-Posta Adresi</label>

              <input 
                type="email" 
                required 
                placeholder="ornek@teknofest.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>Şifre</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button type="submit" style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.85rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}>
              {isRegistering ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </form>

          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{
              background: 'none',
              border: 'none',
              color: '#38bdf8',
              fontSize: '0.85rem',
              marginTop: '1.5rem',
              width: '100%',
              cursor: 'pointer'
            }}
          >
            {isRegistering ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'}
          </button>
        </div>
      </div>
    );
  }

  // --- GİRİŞ YAPILDYSA: KANBAN GÖREV PANELİ ---
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Üst Bar */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✈️</span>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>TEKNOFEST Asistan</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>👤 {user.email}</span>
          <button onClick={handleLogout} style={{
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}>Çıkış Yap</button>
        </div>
      </header>

      {/* Ana İçerik */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Görev Ekleme Formu */}
        <form onSubmit={addTask} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Yeni mühendislik / görev tanımı ekle..." 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            style={{
              flex: 1,
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#fff'
            }}
          />
          <button type="submit" style={{
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            + Görev Ekle
          </button>
        </form>

        {/* Kanban Tahtası */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* YAPILACAKLAR */}
          <div style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8', fontSize: '1rem' }}>📌 Yapılacaklar</h3>
            {tasks.filter(t => t.status === 'todo').map(task => (
              <div key={task.id} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #334155' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>{task.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => moveTask(task.id, 'in-progress')} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Başla ➔</button>
                  <button onClick={() => deleteTask(task.id)} style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Sil</button>
                </div>
              </div>
            ))}
          </div>

          {/* DEVAM EDENLER */}
          <div style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#facc15', fontSize: '1rem' }}>⚡ Devam Edenler</h3>
            {tasks.filter(t => t.status === 'in-progress').map(task => (
              <div key={task.id} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #334155' }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>{task.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => moveTask(task.id, 'todo')} style={{ background: '#475569', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>⬅ Geri</button>
                  <button onClick={() => moveTask(task.id, 'done')} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Tamamla ➔</button>
                </div>
              </div>
            ))}
          </div>

          {/* TAMAMLANANLAR */}
          <div style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#4ade80', fontSize: '1rem' }}>✅ Tamamlananlar</h3>
            {tasks.filter(t => t.status === 'done').map(task => (
              <div key={task.id} style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #334155', opacity: 0.8 }}>
                <p style={{ margin: '0 0 0.5rem 0', textDecoration: 'line-through' }}>{task.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => moveTask(task.id, 'in-progress')} style={{ background: '#475569', color: '#fff', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>⬅ Geri</button>
                  <button onClick={() => deleteTask(task.id)} style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Sil</button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}