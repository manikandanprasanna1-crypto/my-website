import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGameInfo = () => useContext(GameContext);

const DEFAULT_STATS = {
  playerName: 'Sung Jin-Woo',
  level: 1,
  xp: 0,
  requiredXp: 100,
  strength: 10,
  speed: 10,
  intelligence: 10,
  discipline: 10,
  streak: 0,
};

const POSSIBLE_DAILIES = [
  { title: '100 Pushups, 100 Situps, 10km Run', category: 'Workout', xpReward: 50, stat: 'strength' },
  { title: 'Read 30 pages of a book', category: 'Study', xpReward: 20, stat: 'intelligence' },
  { title: 'Meditate for 15 minutes', category: 'Productivity', xpReward: 15, stat: 'discipline' },
  { title: '3 Rounds of Shadowboxing', category: 'MMA', xpReward: 25, stat: 'speed' },
  { title: 'Deep Work: 2 Hours Focused', category: 'Productivity', xpReward: 40, stat: 'intelligence' }
];

const INITIAL_QUESTS = [
  { id: 'daily-prereq', title: 'Daily Goal: 100 Pushups, 100 Situps, 10km Run', questType: 'daily', category: 'Workout', xpReward: 50, stat: 'strength', completed: false, date: new Date().toDateString() },
  { id: 'main-1', title: 'Become a D-Rank Hunter', questType: 'main', category: 'MMA', xpReward: 500, stat: 'discipline', completed: false, date: new Date().toDateString() },
];

export const GameProvider = ({ children }) => {
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('soloLevelingStats');
    return savedStats ? JSON.parse(savedStats) : DEFAULT_STATS;
  });

  const [quests, setQuests] = useState(() => {
    const savedQuests = localStorage.getItem('soloLevelingQuests');
    return savedQuests ? JSON.parse(savedQuests) : INITIAL_QUESTS;
  });

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('soloLevelingHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [sysMsg, setSysMsg] = useState('');
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    localStorage.setItem('soloLevelingStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('soloLevelingQuests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('soloLevelingHistory', JSON.stringify(history));
  }, [history]);

  // Daily reset check
  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('soloLevelingLastLogin');
    
    if (lastLogin !== today) {
      if (lastLogin) {
        // Daily reset logic: check incomplete quests, apply penalties
        const incompleteCount = quests.filter(q => !q.completed).length;
        if (incompleteCount > 0) {
          applyPenalty(incompleteCount * 10);
        }
      }
      
      // Reset quests for the new day
      setQuests(prev => {
        // Keep non-daily quests that aren't completed yet
        let newQuests = prev.filter(q => q.questType !== 'daily' && !q.completed);
        
        // Randomly pick 2 daily quests
        const shuffled = [...POSSIBLE_DAILIES].sort(() => 0.5 - Math.random());
        const dailies = shuffled.slice(0, 2).map((d, idx) => ({
          ...d,
          id: `daily-${Date.now()}-${idx}`,
          questType: 'daily',
          completed: false,
          date: today
        }));

        return [...dailies, ...newQuests];
      });
      localStorage.setItem('soloLevelingLastLogin', today);
    }
  }, [quests]);

  const applyPenalty = (penaltyAmount) => {
    setStats(prev => {
      let newXp = prev.xp - penaltyAmount;
      let newLevel = prev.level;
      let newRequiredXp = prev.requiredXp;
      
      if (newXp < 0) {
        if (newLevel > 1) {
          newLevel -= 1;
          newRequiredXp = Math.floor(newRequiredXp / 1.2);
          newXp = newRequiredXp + newXp; 
        } else {
          newXp = 0;
        }
      }
      return { ...prev, xp: newXp, level: newLevel, requiredXp: newRequiredXp, streak: 0 };
    });
  };

  const getRank = (level) => {
    if (level < 10) return 'E-Rank';
    if (level < 20) return 'D-Rank';
    if (level < 30) return 'C-Rank';
    if (level < 40) return 'B-Rank';
    if (level < 50) return 'A-Rank';
    return 'S-Rank';
  };

  const completeQuest = (id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    // Update quest status
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));

    // Calculate rewards
    setStats(prev => {
      let currentXp = prev.xp + quest.xpReward;
      let level = prev.level;
      let requiredXp = prev.requiredXp;
      
      while (currentXp >= requiredXp) {
        currentXp -= requiredXp;
        level += 1;
        requiredXp = Math.floor(requiredXp * 1.2); // XP scaling
        setSysMsg(`LEVEL UP! You are now level ${level}`);
        addNotification(`New Level Reached: ${level}`, 'success');
      }

      const statGrowth = {
        strength: prev.strength,
        speed: prev.speed,
        intelligence: prev.intelligence,
        discipline: prev.discipline + 1, // Always gain discipline for doing tasks
      };
      
      if (quest.stat && statGrowth[quest.stat] !== undefined) {
          statGrowth[quest.stat] += 2; // Specific stat growth
      }

      const newStats = {
        ...prev,
        level,
        xp: currentXp,
        requiredXp,
        ...statGrowth,
        streak: prev.streak + 1
      };
      
      // Log history
      logHistory(newStats);
      return newStats;
    });
  };

  const updatePlayerName = (name) => {
    setStats(prev => ({ ...prev, playerName: name }));
    addNotification('Identity Updated', 'info');
  };

  const resetGame = () => {
    setStats(DEFAULT_STATS);
    setQuests(INITIAL_QUESTS);
    setHistory([]);
    localStorage.removeItem('soloLevelingStats');
    localStorage.removeItem('soloLevelingQuests');
    localStorage.removeItem('soloLevelingHistory');
    localStorage.removeItem('soloLevelingLastLogin');
    addNotification('System Reinitialized', 'error');
    window.location.reload(); // Force reload to ensure a clean state
  };

  const toggleSkipQuest = (id) => {
      const quest = quests.find(q => q.id === id);
      if (!quest || quest.completed) return;
      applyPenalty(quest.xpReward); // penalty based on reward
      setQuests(prev => prev.filter(q => q.id !== id)); // Remove skipped quest
  }

  const addQuest = (quest) => {
    setQuests([...quests, { ...quest, id: Date.now().toString(), completed: false, date: new Date().toDateString(), questType: quest.questType || 'main' }]);
  };

  const deleteQuest = (id) => {
    setQuests(quests.filter(q => q.id !== id));
  };

  const logHistory = (currentStats) => {
    const today = new Date().toDateString();
    setHistory(prev => {
      const newHistory = prev.filter(entry => entry.date !== today);
      return [...newHistory, { date: today, ...currentStats }];
    });
  };

  return (
    <GameContext.Provider value={{ 
      stats, quests, history, sysMsg, setSysMsg, 
      notifications, addNotification, getRank, 
      completeQuest, addQuest, deleteQuest, toggleSkipQuest, 
      updatePlayerName, resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
};
