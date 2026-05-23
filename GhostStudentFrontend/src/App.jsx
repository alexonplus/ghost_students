import { useState } from 'react';
import StudentView from './StudentView';
import TeacherDashboard from './TeacherDashboard';
import RoomLobby from './RoomLobby';
import StudyRoom from './StudyRoom';
import './index.css';

const sessionId = 'Student-' + Math.floor(Math.random() * 1000);

function App() {
  const [view, setView] = useState('home');
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = (code) => {
    setRoomId(code);
    setView('study-room');
  };

  if (view === 'student') return <StudentView />;
  if (view === 'teacher') return <TeacherDashboard />;
  if (view === 'room-lobby') return <RoomLobby onJoin={handleJoinRoom} />;
  if (view === 'study-room') return <StudyRoom roomId={roomId} sessionId={sessionId} />;

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>👻 GhostStudent</h1>
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
