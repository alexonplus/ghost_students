import { useState, useEffect } from 'react';
import StudentView from './StudentView';
import TeacherDashboard from './TeacherDashboard';
import RoomLobby from './RoomLobby';
import StudyRoom from './StudyRoom';
import AuthPage from './AuthPage';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [view, setView] = useState('home');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleAuthSuccess = () => {
    const storedUsername = localStorage.getItem('username');
    setIsAuthenticated(true);
    setUsername(storedUsername);
    setView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setView('home');
  };

  const handleJoinRoom = (code) => {
    setRoomId(code);
    setView('study-room');
  };

  if (!isAuthenticated) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  if (view === 'student') return <StudentView username={username} onLogout={handleLogout} />;
  if (view === 'teacher') return <TeacherDashboard onLogout={handleLogout} />;
  if (view === 'room-lobby') return <RoomLobby onJoin={handleJoinRoom} onLogout={handleLogout} />;
  if (view === 'study-room') return <StudyRoom roomId={roomId} username={username} onLogout={handleLogout} />;

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>👻 GhostStudent</h1>
        <p style={{ color: '#64748b', marginBottom: '12px' }}>Welcome, {username}!</p>
        <p style={{ color: '#64748b', marginBottom: '48px' }}>Don't lose track</p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setView('student')} style={btnStyle('#2563eb')}>
            🎓 I'm a Student
          </button>
          <button onClick={() => setView('room-lobby')} style={btnStyle('#6366f1')}>
            👥 Study with Friend
          </button>
          <button onClick={() => setView('teacher')} style={btnStyle('#7c3aed')}>
            📊 Teacher View
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  padding: '16px 32px', background: bg, color: '#fff',
  border: 'none', borderRadius: '12px', fontSize: '1rem',
  fontWeight: '600', cursor: 'pointer',
});

export default App;
