import React, { useState } from 'react';
import { useGameInfo } from '../context/GameContext';
import { Plus, Check, X, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Workout', 'Study', 'MMA', 'Productivity'];
const STATS = ['strength', 'speed', 'intelligence', 'discipline'];

const Quests = () => {
  const { quests, completeQuest, addQuest, toggleSkipQuest } = useGameInfo();
  
  const [filter, setFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuest, setNewQuest] = useState({ title: '', questType: 'main', category: 'Workout', xpReward: 10, stat: 'strength' });

  const activeQuests = quests.filter(q => !q.completed && (filter === 'All' || q.category === filter));
  
  const dailyQuests = activeQuests.filter(q => q.questType === 'daily' || q.isDaily);
  const mainQuests = activeQuests.filter(q => q.questType === 'main' || !q.questType);
  const minorQuests = activeQuests.filter(q => q.questType === 'minor');

  const completedQuests = quests.filter(q => q.completed && (filter === 'All' || q.category === filter));

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newQuest.title.trim() === '') return;
    
    addQuest({
      ...newQuest,
      xpReward: parseInt(newQuest.xpReward, 10)
    });
    
    setShowAddModal(false);
    setNewQuest({ title: '', questType: 'main', category: 'Workout', xpReward: 10, stat: 'strength' });
  };

  return (
    <div className="animate-pop">
      <div className="card-header" style={{ marginBottom: '1.5rem', borderBottom: 'none' }}>
        <h2>Daily System Quests</h2>
        <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Add Quest
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <Filter size={20} color="var(--text-secondary)" style={{ alignSelf: 'center', marginRight: '0.5rem' }} />
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`icon-btn ${filter === cat ? 'active' : ''}`}
            style={{ 
              backgroundColor: filter === cat ? 'var(--accent-color)' : 'transparent',
              color: filter === cat ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '9999px',
              padding: '0.25rem 1rem'
            }}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
        
        {/* Daily Quests Section */}
        <div className="card" style={{ borderColor: 'var(--danger-color)', boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--danger-color)', textShadow: '0 0 5px rgba(239, 68, 68, 0.5)' }}>[URGENT] Daily Prerequisites ({dailyQuests.length})</h3>
          {dailyQuests.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Daily requirements met. The System is satisfied.</p>
          ) : (
            <div className="quest-list">
              {dailyQuests.map((quest) => (
                <div key={quest.id} className="quest-item" style={{ borderLeft: '4px solid var(--danger-color)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                  <div className="quest-info">
                    <span className="quest-title" style={{ color: 'var(--danger-color)' }}>
                      ⚠️ {quest.title}
                    </span>
                    <div className="quest-meta">
                      <span>[{quest.category}]</span>
                      <span style={{ color: 'var(--success-color)' }}>+{quest.xpReward} XP</span>
                      <span style={{ color: 'var(--rank-b)' }}>+{quest.stat.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="quest-actions">
                    <button className="success" onClick={() => completeQuest(quest.id)} title="Complete Quest">
                      <Check size={18} />
                    </button>
                    <button className="danger" onClick={() => {
                      if(window.confirm(`Skip this quest? You will lose ${quest.xpReward} XP as a penalty.`)) {
                         toggleSkipQuest(quest.id);
                      }
                    }} title="Skip Quest (Penalty)" disabled>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Quests Section */}
        <div className="card" style={{ borderColor: 'var(--accent-color)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Active Main Quests ({mainQuests.length + minorQuests.length})</h3>
          {(mainQuests.length + minorQuests.length) === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active quests. Add one to clear the dungeon!</p>
          ) : (
            <div className="quest-list">
              {[...mainQuests, ...minorQuests].map((quest) => (
                <div key={quest.id} className="quest-item" style={{ borderLeft: quest.questType === 'main' ? '4px solid var(--rank-s)' : '4px solid var(--accent-color)' }}>
                  <div className="quest-info">
                    <span className="quest-title" style={{ color: quest.questType === 'main' ? 'var(--rank-s)' : 'inherit' }}>
                      {quest.questType === 'main' && '⭐ '} {quest.title}
                    </span>
                    <div className="quest-meta">
                      <span>[{quest.category}]</span>
                      <span style={{ color: 'var(--success-color)' }}>+{quest.xpReward} XP</span>
                      <span style={{ color: 'var(--rank-b)' }}>+{quest.stat.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="quest-actions">
                    <button className="success" onClick={() => completeQuest(quest.id)} title="Complete Quest">
                      <Check size={18} />
                    </button>
                    <button className="danger" onClick={() => {
                      if(window.confirm(`Skip this quest? You will lose ${quest.xpReward} XP as a penalty.`)) {
                         toggleSkipQuest(quest.id);
                      }
                    }} title="Skip Quest (Penalty)">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {completedQuests.length > 0 && (
          <div className="card" style={{ opacity: 0.7 }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>Completed Quests ({completedQuests.length})</h3>
            <div className="quest-list">
              {completedQuests.map(quest => (
                <div key={quest.id} className="quest-item" style={{ borderLeft: '4px solid var(--success-color)' }}>
                   <div className="quest-info" style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                    <span className="quest-title">{quest.title}</span>
                    <div className="quest-meta">
                      <span>[{quest.category}]</span>
                      <span>+{quest.xpReward} XP</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--success-color)' }}><Check size={20} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Create New Quest</h2>
            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quest Objective</label>
                <input 
                  type="text" 
                  value={newQuest.title}
                  onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                  placeholder="e.g. 10km Run"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                  <select 
                    value={newQuest.category}
                    onChange={(e) => setNewQuest({...newQuest, category: e.target.value})}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quest Type</label>
                   <select 
                    value={newQuest.questType}
                    onChange={(e) => setNewQuest({...newQuest, questType: e.target.value})}
                  >
                    <option value="main">Main Quest (⭐)</option>
                    <option value="minor">Minor Quest</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>XP Reward</label>
                  <input 
                    type="number" 
                    min="5" max="500" step="5"
                    value={newQuest.xpReward}
                    onChange={(e) => setNewQuest({...newQuest, xpReward: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Stat Boost</label>
                   <select 
                    value={newQuest.stat}
                    onChange={(e) => setNewQuest({...newQuest, stat: e.target.value})}
                  >
                    {STATS.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
                <button type="submit">Deploy Quest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quests;
