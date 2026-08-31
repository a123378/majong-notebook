import React from 'react';
import { Moon, Sun, Settings, History, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePwa } from '../../context/PwaContext';
import { useSync } from '../../context/SyncContext';
import { useGame } from '../../context/GameContext';
import { playTileClickSound } from '../../services/sound';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHistory?: () => void;
  onOpenSync: () => void;
  onOpenInstall: () => void;
  activeTab: 'dashboard' | 'history';
  setActiveTab: (tab: 'dashboard' | 'history') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenSync,
  onOpenInstall,
  activeTab,
  setActiveTab,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, isInstalled } = usePwa();
  const { isOnline, isSyncing, queueCount, config } = useSync();
  const { activeGame } = useGame();

  const handleToggleTheme = () => {
    playTileClickSound();
    toggleTheme();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-900 p-0.5 shadow-md shadow-emerald-900/20 flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="./favicon.svg" alt="麻將紀錄 Logo" className="w-full h-full object-contain drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                麻將紀錄
              </h1>
            </div>
            {/* Base & Tai Pill */}
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                底 <strong className="text-emerald-600 dark:text-emerald-400 font-bold">${activeGame.base}</strong> / 台 <strong className="text-amber-600 dark:text-amber-400 font-bold">${activeGame.taiPrice}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* PWA Install Button (If not installed) */}
          {isInstallable && !isInstalled && (
            <button
              onClick={onOpenInstall}
              title="安裝 App 到主畫面"
              className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all animate-pulse-subtle"
            >
              <Download size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">安裝 App</span>
            </button>
          )}

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={onOpenSync}
            title={
              !isOnline
                ? '目前處於離線狀態 (離線快取中)'
                : config.enabled
                ? `已連線至房間: ${config.roomCode}`
                : '雲端同步 (未加入房間)'
            }
            className={`relative p-2 rounded-lg border transition-all ${
              !isOnline
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                : config.enabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isSyncing ? (
              <RefreshCw size={16} className="animate-spin text-emerald-500" />
            ) : !isOnline ? (
              <WifiOff size={16} />
            ) : (
              <Wifi size={16} />
            )}

            {/* Offline Sync Queue Badge */}
            {queueCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {queueCount}
              </span>
            )}
          </button>

          {/* History / Tab Toggle */}
          <button
            onClick={() => {
              playTileClickSound();
              setActiveTab(activeTab === 'dashboard' ? 'history' : 'dashboard');
            }}
            title={activeTab === 'dashboard' ? '查看歷史戰績' : '返回記帳主頁'}
            className={`p-2 rounded-lg border transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <History size={16} />
          </button>

          {/* Dark/Light Mode Switch */}
          <button
            onClick={handleToggleTheme}
            title={theme === 'dark' ? '切換淺色模式' : '切換深色模式'}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-slate-600" />
            )}
          </button>

          {/* Settings Menu Button */}
          <button
            onClick={onOpenSettings}
            title="遊戲設定與結算"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
