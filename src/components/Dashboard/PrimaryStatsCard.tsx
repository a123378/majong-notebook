import React from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Flame } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const PrimaryStatsCard: React.FC = () => {
  const { activeGame } = useGame();
  const netAmount = activeGame.netAmount;
  const isPositive = netAmount > 0;
  const isNegative = netAmount < 0;

  // Format amount with commas
  const formattedAmount = Math.abs(netAmount).toLocaleString();

  // Calculate elapsed time
  const getElapsedString = () => {
    const elapsedMs = Date.now() - activeGame.startTime;
    const minutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours} 小時 ${remainingMinutes} 分`;
    }
    return `${remainingMinutes} 分鐘`;
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Background Decorative Radial Gradient & Mahjong Glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-20 dark:opacity-30 pointer-events-none transition-colors duration-500 ${
          isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />
      <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full blur-3xl opacity-10 dark:opacity-20 pointer-events-none bg-teal-500" />

      {/* Card Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <Flame size={13} className="text-amber-500 dark:text-amber-400" />
            本場盈虧結算
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          <Clock size={12} className="text-slate-400" />
          <span>{getElapsedString()}</span>
        </div>
      </div>

      <div className="mt-8 mb-6 flex flex-col items-center justify-center relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`p-1.5 rounded-full ${
              isPositive
                ? 'bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : isNegative
                ? 'bg-rose-100/50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={24} strokeWidth={2.5} />
            ) : isNegative ? (
              <TrendingDown size={24} strokeWidth={2.5} />
            ) : (
              <Minus size={24} strokeWidth={2.5} />
            )}
          </div>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide">
            {isPositive ? '目前領先' : isNegative ? '目前落後' : '平局持平'}
          </span>
        </div>

        <div className="flex items-baseline gap-1 relative group cursor-default">
          <span
            className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter transition-colors duration-500 ${
              isPositive
                ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isNegative
                ? 'text-rose-500 dark:text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPositive ? '+' : isNegative ? '-' : ''}
          </span>
          <span
            className={`text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter transition-colors duration-500 ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : isNegative
                ? 'text-rose-600 dark:text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {formattedAmount}
          </span>
        </div>
      </div>

      {/* Footer Stats Row */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/60 relative z-10">
        <div className="flex flex-col text-left pl-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            基本設定
          </span>
          <span className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 font-mono tracking-tight">
            底{activeGame.base} / 台{activeGame.taiPrice}
          </span>
        </div>
        <div className="flex flex-col text-right pr-2">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            進行局數
          </span>
          <span className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200 font-mono tracking-tight">
            第 <span className="text-blue-500">{activeGame.rounds.length + 1}</span> 局
          </span>
        </div>
      </div>
    </div>
  );
};