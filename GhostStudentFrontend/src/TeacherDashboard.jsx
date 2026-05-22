import { useState, useEffect } from 'react';

const API = 'https://localhost:7188';

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchRadar = async () => {
      try {
        const res = await fetch(`${API}/api/session/radar`);
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error('Radar failed', err);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 5000);
    return () => clearInterval(interval);
  }, []);

  const getRowClass = (score) => {
    if (score > 80) return 'bg-green-100 text-green-900';
    if (score < 50) return 'bg-red-200 text-red-900 animate-pulse';
    return 'bg-yellow-100 text-yellow-900';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Live Classroom Radar</h1>
      {students.length === 0 && (
        <p className="text-gray-500">No active students yet...</p>
      )}
      <div className="grid gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className={`p-4 rounded-lg flex justify-between items-center shadow ${getRowClass(student.score)}`}
          >
            <span className="font-bold">{student.sessionId}</span>
            <span className="text-xl">Score: {student.score}%</span>
            <span>{student.isPresent ? '👀 Watching' : '👻 Ghosting!'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
