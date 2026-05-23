import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5126';

const getScoreColor = (score) => {
  if (score > 80) return '#4ade80';
  if (score < 50) return '#ef4444';
  return '#facc15';
};

const ScoreCard = ({ player, isYou }) => (
  <div style={{
    background: '#1e293b', borderRadius: '16px', padding: '32px',
    textAlign: 'center', flex: 1, border: isYou ? '2px solid #6366f1' : '2px solid #334155',
  }}>
    <p style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '0.85rem' }}>
      {isYou ? '👤 You' : '👥 Friend'}
    </p>
    <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', marginBottom: '24px' }}>
      {player.sessionId}
    </p>
    <div style={{ fontSize: '5rem', fontWeight: 'bold', color: getScoreColor(player.score) }}>
      {player.score}
    </div>
    <p style={{ color: '#64748b', marginTop: '8px' }}>Focus Score</p>
    <div style={{
      marginTop: '16px', padding: '8px 16px', borderRadius: '999px',
      background: player.isPresent ? '#14532d' : '#450a0a',
      color: player.isPresent ? '#4ade80' : '#ef4444',
      fontSize: '0.85rem', display: 'inline-block',
    }}>
      {player.isPresent ? '✅ Focused' : '👻 Distracted'}
    </div>
  </div>
);

export default function StudyRoom({ roomId, sessionId }) {
  const [players, setPlayers] = useState([]);
  const [waiting, setWaiting] = useState(true);
  const [score, setScore] = useState(100);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${API}/api/room/${roomId}`);
        const data = await res.json();
        setPlayers(data);
        if (data.length >= 1) setWaiting(false);
      } catch (err) {
        console.error('Room fetch failed', err);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    const heartbeat = setInterval(() => {
      fetch(`${API}/api/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          score,
          isPresent: !document.hidden,
          roomId,
        }),
      }).catch(err => console.error('Heartbeat failed', err));
    }, 5000);

    return () => clearInterval(heartbeat);
  }, [sessionId, score, roomId]);

  const me = players.find(p => p.sessionId === sessionId);
  const others = players.filter(p => p.sessionId !== sessionId);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '40px 32px', color: '#fff' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>👥 Study Room</h1>
        <p style={{ color: '#64748b' }}>
          Room code: <span style={{ color: '#a5b4fc', fontWeight: 'bold', letterSpacing: '3px' }}>{roomId}</span>
        </p>
      </div>

      {waiting && others.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '80px' }}>
          <p style={{ fontSize: '1.2rem' }}>⏳ Waiting for your friend to join...</p>
          <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Share the room code:</p>
          <button
            onClick={handleCopyCode}
            style={{
              marginTop: '16px', padding: '10px 24px', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            {copied ? '✅ Copied!' : `📋 ${roomId}`}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
          {me && <ScoreCard player={me} isYou={true} />}
          {others.map(p => <ScoreCard key={p.sessionId} player={p} isYou={false} />)}
        </div>
      )}

      {me && others.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '1.1rem' }}>
          {me.score > others[0].score
            ? <p style={{ color: '#4ade80' }}>🏆 You're winning! Keep it up.</p>
            : me.score < others[0].score
            ? <p style={{ color: '#ef4444' }}>📚 Your friend is more focused. Catch up!</p>
            : <p style={{ color: '#facc15' }}>🤝 You're tied!</p>
          }
        </div>
      )}
    </div>
  );
}
