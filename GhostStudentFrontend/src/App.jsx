import { useState } from 'react';
import StudentView from './StudentView';
import TeacherDashboard from './TeacherDashboard';
import './index.css';

function App() {
  const [view, setView] = useState('home');

  if (view === 'student') return <StudentView />;
  if (view === 'teacher') return <TeacherDashboard />;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">👻 GhostStudent</h1>
        <p className="text-gray-400 mb-10">Don't lose track</p>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => setView('student')}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700"
          >
            I'm a Student
          </button>
          <button
            onClick={() => setView('teacher')}
            className="px-8 py-4 bg-purple-600 text-white rounded-xl text-lg font-semibold hover:bg-purple-700"
          >
            I'm a Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
