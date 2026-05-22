import { useState } from 'react';

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function RoomLobby({ onJoin }) {
  const [joinCode, setJoinCode] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    const code = generateRoomCode();
    setCreatedCode(code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterRoom = (code) => {
    if (!code || code.length < 4) {
      setError('Enter a valid room code');
      return;
    }
    onJoin(code.toUpperCase());
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>👥 Study Room</h1>
        <p style={styles.subtitle}>Study together, stay focused together</p>

        {/* Create Room */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Create a Room</h2>
          <p style={styles.hint}>Generate a code and share it with your friend</p>

          {!createdCode ? (
            <button onClick={handleCreate} style={styles.btnPrimary}>
              Generate Room Code
            </button>
          ) : (
            <div style={styles.codeBox}>
              <span style={styles.code}>{createdCode}</span>
              <button onClick={handleCopy} style={styles.btnCopy}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
          )}

          {createdCode && (
            <button onClick={() => handleEnterRoom(createdCode)} style={{ ...styles.btnPrimary, marginTop: '12px' }}>
              Enter Room →
            </button>
          )}
        </div>

        <div style={styles.divider}>— or —</div>

        {/* Join Room */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Join a Room</h2>
          <p style={styles.hint}>Enter the code your friend sent you</p>

          <div style={styles.inputRow}>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. ABC123"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
              style={styles.input}
            />
            <button onClick={() => handleEnterRoom(joinCode)} style={styles.btnJoin}>
              Join
            </button>
          </div>
          {error && <p style={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#0f172a',
  },
  card: {
    background: '#1e293b', borderRadius: '16px', padding: '48px',
    textAlign: 'center', color: '#fff', minWidth: '420px',
  },
  title: { fontSize: '2rem', marginBottom: '8px' },
  subtitle: { color: '#94a3b8', marginBottom: '32px' },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' },
  hint: { color: '#64748b', fontSize: '0.85rem', marginBottom: '14px' },
  btnPrimary: {
    padding: '12px 28px', background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '1rem',
    cursor: 'pointer', width: '100%',
  },
  codeBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '12px', background: '#0f172a', padding: '16px',
    borderRadius: '10px',
  },
  code: { fontSize: '2rem', fontWeight: 'bold', letterSpacing: '6px', color: '#a5b4fc' },
  btnCopy: {
    padding: '8px 16px', background: '#334155', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
  },
  divider: { color: '#475569', margin: '8px 0 24px' },
  inputRow: { display: 'flex', gap: '8px' },
  input: {
    flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
    fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center',
    background: '#0f172a', color: '#fff',
  },
  btnJoin: {
    padding: '12px 20px', background: '#0ea5e9', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
  },
  error: { color: '#ef4444', marginTop: '8px', fontSize: '0.85rem' },
};
