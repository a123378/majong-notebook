import React, { useState } from 'react';
import { Header } from './components/Dashboard/Header';
import { PrimaryStatsCard } from './components/Dashboard/PrimaryStatsCard';
import { SecondaryStats } from './components/Dashboard/SecondaryStats';
import { ProbabilityMetrics } from './components/Dashboard/ProbabilityMetrics';
import { ActionGrid } from './components/Dashboard/ActionGrid';
import { CurrentRoundLedger } from './components/Dashboard/CurrentRoundLedger';
import { HistoryView } from './components/History/HistoryView';

import { TsumoFlowModal } from './components/Modals/TsumoFlowModal';
import { NumpadModal } from './components/Modals/NumpadModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { EndGameModal } from './components/Modals/EndGameModal';
import { CloudSyncModal } from './components/Modals/CloudSyncModal';
import { InstallPwaModal } from './components/Modals/InstallPwaModal';
import { TaiCheatSheetModal } from './components/Modals/TaiCheatSheetModal';

import { RoundActionType } from './types/mahjong';
import { useGame } from './context/GameContext';
import { calculateRound } from './services/calculations';

export const App: React.FC = () => {
  const { activeGame, addRound } = useGame();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTsumoFlowOpen, setIsTsumoFlowOpen] = useState(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [isEndGameOpen, setIsEndGameOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Numpad modal parameters
  const [currentActionType, setCurrentActionType] = useState<RoundActionType>('win');
  const [currentIsDealer, setCurrentIsDealer] = useState<boolean>(false);
  const [currentStreakCount, setCurrentStreakCount] = useState<number>(0);

  // Action Click Handling
  const handleSelectAction = (action: RoundActionType) => {
    if (action === 'tsumo') {
      setIsTsumoFlowOpen(true);
    } else {
      setCurrentActionType(action);
      setCurrentIsDealer(false);
      setCurrentStreakCount(0);
      setIsNumpadOpen(true);
    }
  };

  // Tsumo Flow completed -> Proceed to Numpad
  const handleTsumoProceed = (isDealer: boolean, streakCount: number) => {
    setCurrentActionType('tsumo');
    setCurrentIsDealer(isDealer);
    setCurrentStreakCount(streakCount);
    setIsTsumoFlowOpen(false);
    setIsNumpadOpen(true);
  };

  // Quick Draw (流局沒事: $0 / +1 round)
  const handleQuickDraw = async () => {
    const round = calculateRound({
      actionType: 'draw',
      base: activeGame.base,
      taiPrice: activeGame.taiPrice,
      taiCount: 0,
      roundNumber: activeGame.rounds.length + 1,
    });
    await addRound(round);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Sticky App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setActiveTab('history')}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Main Content Area (Max width 520px for mobile app feel) */}
      <main className="flex-1 max-w-lg w-full mx-auto px-3.5 py-3 sm:py-4 space-y-3.5 sm:space-y-4">
        {activeTab === 'dashboard' ? (
          <>
            {/* 1. 醒目主數據卡片 (本場盈虧金額 & 總局數) */}
            <PrimaryStatsCard />

            {/* 2. 次要數據 (自摸/胡牌/放槍/被自摸/流局) */}
            <SecondaryStats />

            {/* 3. 機率統計 (自摸率/胡牌率/放槍率) */}
            <ProbabilityMetrics />

            {/* 4. 操作按鈕區 [胡牌] [自摸] [放槍] [被自摸] [流局] */}
            <ActionGrid
              onSelectAction={handleSelectAction}
              onQuickDraw={handleQuickDraw}
            />

            {/* 5. 本場每局即時明細流水帳 */}
            <CurrentRoundLedger />
          </>
        ) : (
          /* 歷史戰績與戰報檢視頁 */
          <HistoryView />
        )}
      </main>

      {/* Floating Bottom Tab Bar for Mobile Navigation */}
      <nav className="sticky bottom-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-6 sm:hidden">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 font-bold text-xs transition-colors ${
              activeTab === 'dashboard'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span className="text-lg">🀄</span>
            <span>記帳主頁</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center py-1 font-bold text-xs transition-colors ${
              activeTab === 'history'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span className="text-lg">📊</span>
            <span>歷史戰績</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      <TsumoFlowModal
        isOpen={isTsumoFlowOpen}
        onClose={() => setIsTsumoFlowOpen(false)}
        onProceedToNumpad={handleTsumoProceed}
      />

      <NumpadModal
        isOpen={isNumpadOpen}
        onClose={() => setIsNumpadOpen(false)}
        actionType={currentActionType}
        isDealer={currentIsDealer}
        streakCount={currentStreakCount}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenEndGame={() => setIsEndGameOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      <EndGameModal
        isOpen={isEndGameOpen}
        onClose={() => setIsEndGameOpen(false)}
        onViewHistory={() => setActiveTab('history')}
      />

      <CloudSyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
      />

      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      <TaiCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};
