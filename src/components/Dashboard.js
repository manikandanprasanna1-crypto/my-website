import React, { useState } from 'react';
import { useGameInfo } from '../context/GameContext';
import { User, Target, Flame, Calendar, Trophy, Zap, Edit2, Check } from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip as ChartTooltip } from 'recharts';

const Dashboard = () => {
  const { stats, getRank, history, updatePlayerName, resetGame } = useGameInfo();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(stats.playerName || 'Sung Jin-Woo');
  
  const rank = getRank(stats.level);
  const progressPercent = Math.min((stats.xp / stats.requiredXp) * 100, 100);

  const radarData = [
    { subject: 'STR', A: stats.strength, fullMark: 100 },
    { subject: 'SPD', A: stats.speed, fullMark: 100 },
    { subject: 'INT', A: stats.intelligence, fullMark: 100 },
    { subject: 'DIS', A: stats.discipline, fullMark: 100 },
  ];

  return (
    <div className="animate-pop">
      <div className="card mb-4" style={{border: '1px solid var(--accent-color)'}}>
        <div className="player-header">
          <div className="avatar-placeholder">
            <User size={40} color="var(--accent-color)" />
          </div>
          
          <div className="player-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isEditingName ? (
                    <>
                       <input 
                         type="text" 
                         value={tempName} 
                         onChange={(e) => setTempName(e.target.value)}
                         style={{ marginBottom: 0, padding: '0.25rem', width: '150px' }}
                       />
                       <button className="icon-btn success" onClick={() => { updatePlayerName(tempName); setIsEditingName(false); }} title="Save">
                         <Check size={16} />
                       </button>
                    </>
                  ) : (
                    <>
                      <h2>{stats.playerName || 'Sung Jin-Woo'}</h2>
                      <button className="icon-btn" onClick={() => setIsEditingName(true)} title="Edit Name">
                        <Edit2 size={16} />
                      </button>
                    </>
                  )}
                </div>
                <div className={`rank-badge`} style={{ backgroundColor: `var(--rank-${rank.split('-')[0].toLowerCase()})`, color: '#000', marginTop: '0.5rem' }}>
                  {rank}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-color)', textShadow: 'var(--accent-glow)' }}>
                   Lv. {stats.level}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>XP</span>
                <span>{stats.xp} / {stats.requiredXp}</span>
              </div>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Attributes</h3>
            <Zap size={20} color="var(--accent-color)" />
          </div>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 20']} tick={false} axisLine={false} />
                <Radar name="Player Stats" dataKey="A" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.6} />
                <ChartTooltip contentStyle={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="stats-list mt-4">
            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>STR</span>
              <span className="font-bold">{stats.strength}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>SPD</span>
              <span className="font-bold">{stats.speed}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>INT</span>
              <span className="font-bold">{stats.intelligence}</span>
            </div>
            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>DIS</span>
              <span className="font-bold">{stats.discipline}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Player Status</h3>
            <Target size={20} color="var(--accent-color)" />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="stat-item" style={{ fontSize: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Flame color="var(--danger-color)" />
                 <span>Current Streak</span>
              </div>
              <span className="font-bold">{stats.streak} Days</span>
            </div>

            <div className="stat-item" style={{ fontSize: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Calendar color="var(--success-color)" />
                 <span>Days Active</span>
              </div>
              <span className="font-bold">{history.length + 1} Days</span>
            </div>

            <div style={{ marginTop: '1rem' }}>
               <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>System Status</h4>
               <div className="stat-item" style={{ justifyContent: 'flex-start', gap: '1rem', border: '1px solid var(--accent-color)' }}>
                 <Trophy color="var(--accent-color)" size={16} />
                 <div>
                    <div className="font-bold">{rank} Participant</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Track your daily habits to level up.</div>
                 </div>
               </div>

               <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 51, 102, 0.2)' }}>
                 <h4 style={{ color: 'var(--danger-color)', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8 }}>DANGER ZONE</h4>
                 <button 
                   className="danger" 
                   style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem' }}
                   onClick={() => {
                     if(window.confirm('WARNING: This will PERMANENTLY WIPE all Player Stats, Levels, and Quest History. The System will be reinitialized. Proceed?')) {
                       resetGame();
                     }
                   }}
                 >
                   RESET SYSTEM
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
