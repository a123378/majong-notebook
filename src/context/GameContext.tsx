import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameSession, RoundRecord, GameStats } from '../types/mahjong';
import { calculateStats } from '../services/calculations';
import {
  getCurrentGameDB,
  saveCurrentGameDB,
  clearCurrentGameDB,
  getAllGameHistoryDB,
  saveGameToHistoryDB,
  deleteGameFromHistoryDB,
  getSettingDB,
  setSettingDB,
} from '../services/db';
import { queueOrPushSession } from '../services/syncService';
import { playLossSound, playTileClickSound, playWinSound, playDrawSound } from '../services/sound';

interface GameContextType {
  activeGame: GameSession;
  historySessions: GameSession[];
  setBaseAndTai: (base: number, taiPrice: number) => Promise<void>;
  addRound: (round: RoundRecord) => Promise<void>;
  undoLastRound: () => Promise<void>;
  finishAndArchiveGame: () => Promise<GameSession>;
  resetCurrentGame: () => Promise<void>;
  deleteHistorySession: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_STATS: GameStats = {
  totalRounds: 0,
  netAmount: 0,
  tsumoCount: 0,
  winCount: 0,
  dealInCount: 0,
  tsumoLossCount: 0,
  drawCount: 0,
  tsumoRate: 0,
  winRate: 0,
  dealInRate: 0,
  tsumoLossRate: 0,
  drawRate: 0,
  overallWinRate: 0,
};

function createNewGameSession(base = 50, taiPrice = 20): GameSession {
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `game_${Date.now()}`,
    title: `暻餃??啣? (${dateStr})`,
    base,
    taiPrice,
    startTime: Date.now(),
    rounds: [],
    netAmount: 0,
    stats: { ...DEFAULT_STATS },
    isArchived: false,
    updatedAt: Date.now(),
  };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGame, setActiveGame] = useState<GameSession>(() => createNewGameSession(50, 20));
  const [historySessions, setHistorySessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from IndexedDB
  useEffect(() => {
    async function init() {
      try {
        const savedBase = await getSettingDB<number>('default_base', 50);
        const savedTai = await getSettingDB<number>('default_tai', 20);

        const current = await getCurrentGameDB();
        if (current && !current.isArchived) {
          setActiveGame(current);
        } else {
          setActiveGame(createNewGameSession(savedBase, savedTai));
        }

        // Fetch from IndexedDB first for fast load
        const localHistory = await getAllGameHistoryDB();
        setHistorySessions(localHistory);
        

        
      } catch (e) {
        console.error('Failed to init GameContext:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Firebase Auth & Sync
  useEffect(() => {
    let unsubscribeFirebase: (() => void) | undefined;
    
    import('../services/firebase').then(({ auth }) => {
      auth.onAuthStateChanged((user) => {
        if (unsubscribeFirebase) unsubscribeFirebase();
        
        if (user) {
          import('../services/syncService').then(({ subscribeToRemoteSessions }) => {
            unsubscribeFirebase = subscribeToRemoteSessions((sessions) => {
              if (sessions.length > 0) {
                setHistorySessions(sessions);
              }
            });
          });
        } else {
          // Revert to local IndexedDB when logged out
          import('../services/db').then(({ getAllGameHistoryDB }) => {
             getAllGameHistoryDB().then(setHistorySessions).catch(console.error);
          });
        }
      });
    });

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, []);

  const refreshHistory = useCallback(async () => {
    const history = await getAllGameHistoryDB();
    setHistorySessions(history);
  }, []);

  const setBaseAndTai = useCallback(
    async (base: number, taiPrice: number) => {
      const updated: GameSession = {
        ...activeGame,
        base,
        taiPrice,
        updatedAt: Date.now(),
      };
      setActiveGame(updated);
      await saveCurrentGameDB(updated);
      await setSettingDB('default_base', base);
      await setSettingDB('default_tai', taiPrice);
      await queueOrPushSession(updated);
    },
    [activeGame]
  );

  const addRound = useCallback(
    async (round: RoundRecord) => {
      const newRounds = [round, ...activeGame.rounds];
      const stats = calculateStats(newRounds);

      const updated: GameSession = {
        ...activeGame,
        rounds: newRounds,
        netAmount: stats.netAmount,
        stats,
        updatedAt: Date.now(),
      };

      setActiveGame(updated);
      await saveCurrentGameDB(updated);
      await queueOrPushSession(updated);

      // Play Sound
      if (round.actionType === 'tsumo' || round.actionType === 'win') {
        playWinSound();
        // Confetti for Big Win (e.g. >= 4??or net >= 200)
        if (round.taiCount >= 4 || round.amount >= 200) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'],
            });
          } catch {}
        }
      } else if (round.actionType === 'dealIn' || round.actionType === 'tsumoLoss') {
        playLossSound();
      } else if (round.actionType === 'draw') {
        playDrawSound();
      } else {
        playTileClickSound();
      }
    },
    [activeGame]
  );

  const undoLastRound = useCallback(async () => {
    if (activeGame.rounds.length === 0) return;
    playTileClickSound();

    const newRounds = activeGame.rounds.slice(1);
    const stats = calculateStats(newRounds);

    const updated: GameSession = {
      ...activeGame,
      rounds: newRounds,
      netAmount: stats.netAmount,
      stats,
      updatedAt: Date.now(),
    };

    setActiveGame(updated);
    await saveCurrentGameDB(updated);
    await queueOrPushSession(updated);
  }, [activeGame]);

  const finishAndArchiveGame = useCallback(async (): Promise<GameSession> => {
    const archived: GameSession = {
      ...activeGame,
      endTime: Date.now(),
      isArchived: true,
      updatedAt: Date.now(),
    };

    // Save to history in DB & Cloud
    await saveGameToHistoryDB(archived);
    await queueOrPushSession(archived);
    await clearCurrentGameDB();

    // Create fresh new game session with same Base & Tai
    const freshGame = createNewGameSession(activeGame.base, activeGame.taiPrice);
    setActiveGame(freshGame);
    await saveCurrentGameDB(freshGame);

    // Refresh history
    await refreshHistory();
    playWinSound();

    return archived;
  }, [activeGame, refreshHistory]);

  const resetCurrentGame = useCallback(async () => {
    playTileClickSound();
    const oldId = activeGame.id;
    const freshGame = createNewGameSession(activeGame.base, activeGame.taiPrice);
    setActiveGame(freshGame);
    await saveCurrentGameDB(freshGame);
    await queueOrPushSession(freshGame);
    
    // Also delete the abandoned old game from local DB and Firebase
    await deleteGameFromHistoryDB(oldId);
    import('../services/syncService').then(({ deleteRemoteSession }) => {
      deleteRemoteSession(oldId).catch(console.error);
    });
  }, [activeGame]);

  const deleteHistorySession = useCallback(
    async (id: string) => {
      await deleteGameFromHistoryDB(id);
      
      import('../services/syncService').then(({ deleteRemoteSession }) => {
        deleteRemoteSession(id).catch(console.error);
      });
      
      await refreshHistory();
    },
    [refreshHistory]
  );

  return (
    <GameContext.Provider
      value={{
        activeGame,
        historySessions,
        setBaseAndTai,
        addRound,
        undoLastRound,
        finishAndArchiveGame,
        resetCurrentGame,
        deleteHistorySession,
        refreshHistory,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
