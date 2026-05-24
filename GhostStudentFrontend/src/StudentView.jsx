import React, { useState, useEffect, useRef } from 'react';
import { FiVideo, FiMic, FiShare, FiMessageSquare, FiXCircle } from 'react-icons/fi';
import ContentPlayer from './ContentPlayer';

const API = 'http://localhost:5126';

const StudentView = ({ username, onLogout }) => {
  const sessionId = username;
  const sessionStartTime = useRef(Date.now());
  const [focusScore, setFocusScore] = useState(100);
  const [isDistracted, setIsDistracted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [timeDistracted, setTimeDistracted] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [embedId, setEmbedId] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const [nextQuizIn, setNextQuizIn] = useState(15);
  const [xp, setXp] = useState(0);
  const [xpLevel, setXpLevel] = useState(1);
  const [skillName, setSkillName] = useState('');
  const [tempSkill, setTempSkill] = useState('');
  const [levelUpMsg, setLevelUpMsg] = useState(false);
  const [contentType, setContentType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [categories, setCategories] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const isDistractedRef = useRef(false);
  const isPlayingRef = useRef(true);
  const ytPlayer = useRef(null);

  const distractionInterval = useRef(null);
  const quizTimeout = useRef(null);
  const popQuizTimeout = useRef(null);
  const distractionTimer = useRef(null);
  const totalTimer = useRef(null);
  const focusScoreRef = useRef(100);
  const audioCtx = useRef(null);
  const alarmInterval = useRef(null);

  // Create AudioContext on first user interaction so browser allows sound
  const ensureAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const playBeep = () => {
    if (!audioCtx.current) return;
    const ctx = audioCtx.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  };

  const startAlarm = () => {
    playBeep();
    alarmInterval.current = setInterval(playBeep, 800);
  };

  const stopAlarm = () => {
    clearInterval(alarmInterval.current);
  };

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${API}/api/stats/categories`)
      .then(r => r.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Total session timer
  useEffect(() => {
    totalTimer.current = setInterval(() => {
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(totalTimer.current);
  }, []);

  // Load YouTube IFrame API and create player when embedId is set
  useEffect(() => {
    if (!embedId) return;

    const initPlayer = () => {
      ytPlayer.current = new window.YT.Player('yt-player', {
        videoId: embedId,
        playerVars: { autoplay: 1 },
        events: {
          onStateChange: (e) => {
            isPlayingRef.current = e.data === window.YT.PlayerState.PLAYING;
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById('yt-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }

    return () => {
      if (ytPlayer.current) ytPlayer.current.destroy();
    };
  }, [embedId]);

  // XP gain — +1 every 3 seconds while focused AND content is playing
  useEffect(() => {
    if (!contentType) return;
    const xpTimer = setInterval(() => {
      if (!isDistractedRef.current && isPlayingRef.current) {
        setXp(prev => {
          const next = prev + 1;
          if (next >= 100) {
            setXpLevel(lvl => lvl + 1);
            setLevelUpMsg(true);
            setTimeout(() => setLevelUpMsg(false), 2500);
            return 0;
          }
          return next;
        });
      }
    }, 3000);
    return () => clearInterval(xpTimer);
  }, [contentType]);

  // Keep ref in sync so heartbeat always has latest score
  useEffect(() => {
    focusScoreRef.current = focusScore;
  }, [focusScore]);

  // Heartbeat — POST to backend every 5 seconds
  useEffect(() => {
    const heartbeat = setInterval(() => {
      fetch(`${API}/api/session/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          score: focusScoreRef.current,
          isPresent: !document.hidden,
        }),
      }).catch(err => console.error('Heartbeat failed', err));
    }, 5000);

    return () => clearInterval(heartbeat);
  }, []);

  // Tab Tracking & Distraction Timer
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsDistracted(true);
        isDistractedRef.current = true;
        startAlarm();
        distractionInterval.current = setInterval(() => {
          setFocusScore(prevScore => Math.max(0, prevScore - 1));
        }, 1000);
        distractionTimer.current = setInterval(() => {
          setTimeDistracted(prevTime => prevTime + 1);
        }, 1000);
      } else {
        setIsDistracted(false);
        isDistractedRef.current = false;
        stopAlarm();
        clearInterval(distractionInterval.current);
        clearInterval(distractionTimer.current);
        setShowRedFlash(true);
        setTimeout(() => setShowRedFlash(false), 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(distractionInterval.current);
      clearInterval(distractionTimer.current);
    };
  }, []);

  // Pop Quiz Logic — first at 15s (demo), then every 15 min
  useEffect(() => {
    const QUIZ_INTERVAL = 15 * 60; // 15 minutes in seconds
    let countdown = 15; // first quiz after 15 seconds
    setNextQuizIn(countdown);

    const countdownTick = setInterval(() => {
      countdown -= 1;
      setNextQuizIn(countdown);

      if (countdown <= 0) {
        setShowQuiz(true);
        countdown = QUIZ_INTERVAL;
        setNextQuizIn(countdown);

        popQuizTimeout.current = setTimeout(() => {
          handleQuizMiss();
        }, 8000);
      }
    }, 1000);

    quizTimeout.current = countdownTick;

    return () => {
      clearInterval(countdownTick);
      clearTimeout(popQuizTimeout.current);
    };
  }, []);

  const handleQuizClick = () => {
    clearTimeout(popQuizTimeout.current);
    setShowQuiz(false);
    setFocusScore(prevScore => Math.min(100, prevScore + 10)); 
  };

  const handleQuizMiss = () => {
    setShowQuiz(false);
    setFocusScore(prevScore => Math.max(0, prevScore - 20));
  };

  const getScoreColor = (score) => {
    if (score > 80) return '#4ade80'; // green-400
    if (score < 50) return '#ef4444'; // red-500
    return '#facc15'; // yellow-400
  };

  const handleEndSession = async () => {
    clearInterval(totalTimer.current);
    clearInterval(distractionInterval.current);
    clearInterval(distractionTimer.current);
    clearTimeout(quizTimeout.current);
    clearTimeout(popQuizTimeout.current);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId && contentType && sessionStartTimeRef.current) {
      try {
        await fetch(`${API}/api/stats/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            userId: parseInt(userId),
            skillName,
            startedAt: new Date(sessionStartTimeRef.current).toISOString(),
            finalScore: focusScore,
            totalXpEarned: xp,
            totalTimeSeconds: totalTime,
            distractionTimeSeconds: timeDistracted,
            category: selectedCategory
          })
        });
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }

    setSessionEnded(true);
  };

  const detectContentType = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('spotify.com')) return 'spotify';
    return null;
  };

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const extractVimeoId = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleVideoSubmit = (e) => {
    e.preventDefault();
    ensureAudio();

    if (!tempSkill) {
      alert('Please enter a skill name');
      return;
    }

    const type = detectContentType(videoUrl);
    if (!type) {
      alert('Please enter a valid YouTube, Vimeo, or Spotify URL');
      return;
    }

    let content = null;
    if (type === 'youtube') {
      content = extractYouTubeId(videoUrl);
    } else if (type === 'vimeo') {
      content = extractVimeoId(videoUrl);
    } else if (type === 'spotify') {
      content = videoUrl.split('/track/')[1]?.split('?')[0];
    }

    if (content) {
      setContentType(type);
      setSkillName(tempSkill);
      setVideoUrl(content);
      sessionStartTimeRef.current = Date.now();
      isPlayingRef.current = true;
    }
  };

  const handleFileUpload = (e) => {
    ensureAudio();
    const file = e.target.files[0];
    if (!file || !tempSkill) {
      alert('Please enter a skill name');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const type = file.type.includes('pdf') ? 'pdf' : file.type.includes('video') ? 'video' : 'text';
      setContentType(type);
      setSkillName(tempSkill);
      setFileContent(evt.target.result);
      sessionStartTimeRef.current = Date.now();
      isPlayingRef.current = true;
    };
    reader.readAsText(file);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const FocusRing = ({ score }) => {
    return <p style={{ color: getScoreColor(score), fontSize: '3rem', fontWeight: 'bold', margin: '0' }}>{score}</p>;
  };


  if (sessionEnded) {
    const grade = focusScore > 80 ? '🟢 Excellent' : focusScore > 50 ? '🟡 Could be better' : '🔴 Very distracted';
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#fff', minWidth: '380px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>👻 Session Ended</h1>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Here's how you did</p>

          <div style={{ fontSize: '5rem', fontWeight: 'bold', color: getScoreColor(focusScore), marginBottom: '8px' }}>
            {focusScore}
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Focus Score</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '12px 20px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Total session time</span>
              <span>{formatTime(totalTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '12px 20px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Time distracted</span>
              <span style={{ color: '#ef4444' }}>{formatTime(timeDistracted)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '12px 20px', borderRadius: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Result</span>
              <span>{grade}</span>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 32px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', cursor: 'pointer' }}
          >
            New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-view-container">
      {levelUpMsg && (
        <div style={{
          position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
          color: '#fff', padding: '16px 32px', borderRadius: '12px',
          fontSize: '1.2rem', fontWeight: 'bold', zIndex: 1000,
          boxShadow: '0 0 30px rgba(167,139,250,0.6)',
          animation: 'redPulse 0.5s ease-in-out infinite',
        }}>
          ⬆️ LEVEL UP! {skillName} Lv.{xpLevel}
        </div>
      )}

      {showRedFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none',
          border: '8px solid #ef4444',
          boxShadow: 'inset 0 0 80px rgba(239,68,68,0.5)',
          animation: 'redPulse 0.4s ease-in-out infinite',
        }} />
      )}
      {/* Main Content */}
      <main className="main-content">
        <header className="centered-header" style={{ position: 'relative' }}>
          <button onClick={onLogout} style={{ position: 'absolute', top: '0', right: '0', padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Logout
          </button>
          <h1>GhostStudent</h1>
          <p>dont lose track</p>
        </header>
        
        <div className="video-feed">
          {contentType ? (
            <ContentPlayer
              content={contentType === 'video' || contentType === 'pdf' || contentType === 'text' ? fileContent : videoUrl}
              contentType={contentType}
              onReady={() => { isPlayingRef.current = true; }}
              onEnded={() => { isPlayingRef.current = false; }}
            />
          ) : (
            <div className="video-placeholder">
              <p>Select a skill category and paste a link or upload a file</p>
              <form onSubmit={handleVideoSubmit} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Skill name (e.g. C# OOP)"
                  value={tempSkill}
                  onChange={e => setTempSkill(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', width: '300px', color: '#000' }}
                />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(parseInt(e.target.value))}
                  style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', width: '300px', color: '#000' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.xpMultiplier}x XP)</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', width: '300px', color: '#000' }}
                  />
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Play Link
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>Or upload a file:</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: 'none' }}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="controls">
            <button className="control-btn red"><FiMic size={20} /></button>
            <button className="control-btn"><FiVideo size={20} /></button>
            <button className="control-btn"><FiShare size={20} /></button>
            <button className="control-btn"><FiMessageSquare size={20} /></button>
            <button className="control-btn end-call" onClick={handleEndSession}><FiXCircle size={24} /></button>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="right-sidebar">
        <h2>Dashboard</h2>
        <div className="focus-section">
          <h3>Focus Score</h3>
          <FocusRing score={focusScore} />
          {isDistracted && <p className="distracted-warning">You seem distracted!</p>}
        </div>
        {contentType && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '0.85rem' }}>⚔️ {skillName}</span>
              <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Lv.{xpLevel}</span>
            </div>
            <div style={{ background: '#1e293b', borderRadius: '999px', height: '14px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${xp}%`,
                background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                borderRadius: '999px',
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', textAlign: 'right' }}>{xp} / 100 XP</div>
          </div>
        )}

        <div className="stats-section">
            <div className="stat-row">
                <span>Status:</span>
                <span className={isDistracted ? 'status-distracted' : 'status-focused'}>
                    {isDistracted ? 'Distracted' : 'Focused'}
                </span>
            </div>
            <div className="stat-row">
                <span>Time Distracted:</span>
                <span>{formatTime(timeDistracted)}</span>
            </div>
            <div className="stat-row">
                <span>Next Quiz in:</span>
                <span style={{ color: nextQuizIn <= 10 ? '#ef4444' : '#facc15' }}>
                  {formatTime(nextQuizIn)}
                </span>
            </div>
        </div>
      </aside>

      {/* Pop Quiz Modal */}
      {showQuiz && (
        <div className="quiz-modal">
          <div className="quiz-content">
            <h2>Pop Quiz!</h2>
            <p>Click the button to prove you're paying attention!</p>
            <button onClick={handleQuizClick} className="quiz-btn">🎯</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;

