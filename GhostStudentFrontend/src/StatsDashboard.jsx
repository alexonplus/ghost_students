import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API = 'http://localhost:5126';

export default function StatsDashboard({ username, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      onLogout();
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/api/stats/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Categories fetch failed:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/api/stats/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Stats fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchStats();
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <button onClick={onLogout} style={styles.logoutBtn}>
        Logout
      </button>

      <div style={styles.header}>
        <h1>📈 {username}'s Statistics</h1>
        <p>Your learning journey</p>
      </div>

      {/* Category Filter */}
      <div style={styles.filterSection}>
        <label style={{ marginRight: '12px', color: '#94a3b8' }}>Filter by category:</label>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(parseInt(e.target.value))}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
        >
          <option value={0}>All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Study Time</p>
          <p style={styles.cardValue}>{formatTime(stats.totalStudyTimeSeconds)}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Sessions Completed</p>
          <p style={styles.cardValue}>{stats.totalSessions}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Average Focus Score</p>
          <p style={styles.cardValue}>{stats.averageScore}%</p>
        </div>
      </div>

      {/* Focus Graph */}
      <div style={styles.section}>
        <h2>Focus Score Trend (Last 7 Days)</h2>
        {stats.dailyScores.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={styles.noData}>No data yet. Complete some sessions to see your trends!</p>
        )}
      </div>

      {/* Top Skills */}
      <div style={styles.section}>
        <h2>Top Skills</h2>
        {stats.topSkills.length > 0 ? (
          <div>
            {stats.topSkills.map((skill, idx) => (
              <div key={idx} style={styles.skillRow}>
                <div style={styles.skillInfo}>
                  <span style={styles.skillName}>{skill.skillName}</span>
                  <span style={styles.skillStats}>{formatTime(skill.totalTimeSeconds)} • Avg: {skill.averageScore}%</span>
                </div>
                <div style={styles.skillBar}>
                  <div
                    style={{
                      ...styles.skillBarFill,
                      width: `${(skill.totalTimeSeconds / (stats.topSkills[0]?.totalTimeSeconds || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noData}>No skills tracked yet.</p>
        )}
      </div>

      {/* Recent Sessions */}
      <div style={styles.section}>
        <h2>Recent Sessions</h2>
        {stats.recentSessions.length > 0 ? (
          <div>
            {stats.recentSessions.map((session, idx) => (
              <div key={idx} style={styles.sessionRow}>
                <div style={styles.sessionInfo}>
                  <span style={styles.sessionSkill}>{session.skillName}</span>
                  <span style={styles.sessionDate}>{session.date}</span>
                </div>
                <div style={styles.sessionStats}>
                  <span style={styles.sessionScore}>{session.finalScore}%</span>
                  <span style={styles.sessionDuration}>{formatTime(session.durationSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.noData}>No sessions yet. Start learning!</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#fff',
    padding: '40px 32px',
    position: 'relative',
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '12px',
  },
  logoutBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#0f172a',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '40px',
  },
  card: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #334155',
  },
  cardLabel: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '8px',
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#6366f1',
  },
  section: {
    background: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #334155',
  },
  noData: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '24px',
  },
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #334155',
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  skillStats: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  skillBar: {
    flex: 2,
    height: '8px',
    background: '#0f172a',
    borderRadius: '4px',
    marginLeft: '16px',
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
    borderRadius: '4px',
  },
  sessionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#0f172a',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSkill: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  sessionDate: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  sessionStats: {
    textAlign: 'right',
  },
  sessionScore: {
    display: 'block',
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: '4px',
  },
  sessionDuration: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
};
