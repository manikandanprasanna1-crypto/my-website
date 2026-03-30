import React, { useState, useEffect, useRef } from 'react';
import { useGameInfo } from '../context/GameContext';
import { Play, Pause, RotateCcw, Crosshair } from 'lucide-react';

const Training = () => {
  const { addQuest } = useGameInfo();
  const [activeTab, setActiveTab] = useState('timer'); // timer or minigame

  // --- MMA Timer State ---
  const [time, setTime] = useState(300); // 5 mins
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState('work'); // work or rest
  const [restTime, setRestTime] = useState(60); // 1 min rest
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev - 1);
      }, 1000);
    } else if (time === 0) {
      clearInterval(intervalRef.current);
      if (timerType === 'work' && currentRound < rounds) {
        setTimerType('rest');
        setTime(restTime);
        setIsActive(true); // auto start rest
      } else if (timerType === 'rest') {
        setTimerType('work');
        setTime(300); // back to 5 mins default or configurable
        setCurrentRound(prev => prev + 1);
        setIsActive(true);
      } else if (timerType === 'work' && currentRound === rounds) {
         // Finished training
         setIsActive(false);
         alert("Training complete! Consider adding a completed quest for XP.");
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, time, timerType, currentRound, rounds, restTime]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimerType('work');
    setTime(300);
    setCurrentRound(1);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Reaction Minigame State ---
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    let timer;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      alert(`Game Over! Score: ${score}. Adding pseudo-quest for XP...`);
      // Add a dummy quest and complete it for minigame simulation
      const mockGameQuestId = Date.now().toString();
      addQuest({ 
         id: mockGameQuestId, 
         title: `Reaction Game: ${score} Hits`, 
         category: 'Workout', 
         xpReward: score * 2, 
         stat: 'speed',
         completed: false
      });
      // setTimeout(()=>completeQuest(mockGameQuestId), 500);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, addQuest]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    moveTarget();
  };

  const moveTarget = () => {
    setTargetPos({
      top: `${Math.floor(Math.random() * 80) + 10}%`,
      left: `${Math.floor(Math.random() * 80) + 10}%`
    });
  };

  const handleTargetClick = (e) => {
    if (!gameActive) return;
    setScore(prev => prev + 1);
    moveTarget();
  };

  return (
    <div className="animate-pop">
       <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none' }}>
        <h2>Training Facility</h2>
      </div>

       <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('timer')}
          style={{ backgroundColor: activeTab === 'timer' ? 'var(--accent-color)' : 'transparent', border: '1px solid var(--accent-color)', color: activeTab === 'timer' ? '#fff' : 'var(--text-primary)' }}
        >
          Combat Timer
        </button>
        <button 
          onClick={() => setActiveTab('minigame')}
          style={{ backgroundColor: activeTab === 'minigame' ? 'var(--accent-color)' : 'transparent', border: '1px solid var(--accent-color)', color: activeTab === 'minigame' ? '#fff' : 'var(--text-primary)' }}
        >
          Reflex Minigame
        </button>
      </div>

      {activeTab === 'timer' && (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: timerType === 'work' ? 'var(--danger-color)' : 'var(--success-color)' }}>
            {timerType === 'work' ? 'WORK' : 'REST'} - ROUND {currentRound}/{rounds}
          </h3>
          
          <div style={{ fontSize: '6rem', fontWeight: 'bold', fontFamily: 'monospace', margin: '2rem 0', color: 'var(--text-primary)', textShadow: 'var(--accent-glow)' }}>
            {formatTime(time)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
             <button onClick={toggleTimer} style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {isActive ? <Pause size={24} /> : <Play size={24} />}
             </button>
             <button onClick={resetTimer} style={{ width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-primary)' }}>
                 <RotateCcw size={24} />
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label className="text-sm var(--text-secondary)">Round Time (s)</label>
              <input type="number" defaultValue="300" disabled={isActive} onChange={(e) => { if (!isActive) { setTime(parseInt(e.target.value)); } }} />
            </div>
            <div>
              <label className="text-sm var(--text-secondary)">Rest Time (s)</label>
              <input type="number" defaultValue="60" disabled={isActive} onChange={(e) => setRestTime(parseInt(e.target.value))} />
            </div>
            <div>
              <label className="text-sm var(--text-secondary)">Rounds</label>
              <input type="number" defaultValue="3" disabled={isActive} onChange={(e) => setRounds(parseInt(e.target.value))} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'minigame' && (
        <div className="card">
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.25rem' }}>Time Left: <span style={{ color: timeLeft <= 10 ? 'var(--danger-color)' : 'var(--text-primary)' }}>{timeLeft}s</span></div>
              <div style={{ fontSize: '1.25rem' }}>Hits: <span className="text-accent font-bold">{score}</span></div>
           </div>

           <div style={{ 
               position: 'relative', 
               height: '400px', 
               backgroundColor: 'var(--bg-color)', 
               border: '2px dashed var(--border-color)', 
               borderRadius: '0.5rem',
               overflow: 'hidden',
               cursor: gameActive ? 'crosshair' : 'default'
             }}
           >
              {!gameActive && timeLeft === 30 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                   <p className="mb-4 text-secondary">Click the target as fast as possible.</p>
                   <button onClick={startGame} style={{ fontSize: '1.25rem', padding: '1rem 2rem' }}>Start Training</button>
                </div>
              )}

              {!gameActive && timeLeft === 0 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                   <h3 className="mb-4">Training Complete</h3>
                   <p className="mb-4">Speed Score: {score}</p>
                   <button onClick={startGame}>Try Again</button>
                </div>
              )}

              {gameActive && (
                 <div onClick={handleTargetClick} style={{
                    position: 'absolute',
                    top: targetPos.top,
                    left: targetPos.left,
                    transform: 'translate(-50%, -50%)',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--danger-color)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 15px var(--danger-color)',
                    transition: 'all 0.1s ease',
                    cursor: 'crosshair'
                 }}>
                   <Crosshair size={20} />
                 </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Training;
