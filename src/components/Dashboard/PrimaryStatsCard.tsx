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
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-white border border-slate-800 shadow-xl">
      {/* Background Decorative Radial Gradient & Mahjong Glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500 ${
          isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />
      <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none bg-teal-500" />

      {/* Card Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
            <Flame size={13} className="text-amber-400" />
            本場盈虧結算
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
          <Clock size={12} className="text-slate-400" />
          <span>{getElapsedString()}</span>
        </div>
      </div>

      {/* Hero Money Display */}
      <div className="my-2 text-center relative z-10">
        <div className="inline-flex items-baseline justify-center gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-extrabold transition-colors ${
              isPositive
                ? 'text-emerald-400'
                : isNegative
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {isPositive ? '+' : isNegative ? '-' : ''}$
          </span>
          <span
            className={`text-5xl sm:text-6xl font-black tracking-tight font-mono transition-all duration-300 ${
              isPositive
                ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                : isNegative
                ? 'text-rose-400 drop-shadow-[0_0_20px_rgba(251,113,133,0.35)]'
                : 'text-slate-200'
            }`}
          >
            {formattedAmount}
          </span>
        </div>

        {/* Dynamic Status Pill */}
        <div className="mt-2 flex items-center justify-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isNegative
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isPositive ? (
              <>
                <TrendingUp size={13} className="text-emerald-400 stroke-[3]" />
                <span>戰神連勝中 (盈利)</span>
              </>
            ) : isNegative ? (
              <>
                <TrendingDown size={13} className="text-rose-400 stroke-[3]" />
                <span>暫居下風 (虧損)</span>
              </>
            ) : (
              <>
                <Minus size={13} className="text-slate-400 stroke-[3]" />
                <span>收支平衡 ($0)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Total Rounds & Win Rate Highlights */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center relative z-10">
        <div className="bg-slate-800/40 rounded-2xl py-2.5 px-3 border border-slate-700/40">
          <span className="block text-[11px] font-medium text-slate-300 mb-0.5">本場總局數</span>
          <div className="text-xl font-black text-white font-mono flex items-center justify-center gap-1">
            <span>{activeGame.stats.totalRounds}</span>
            <span className="text-xs font-normal text-slate-300">局</span>
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-2xl py-2.5 px-3 border border-slate-700/40">
          <span className="block text-[11px] font-medium text-slate-300 mb-0.5">綜合勝率</span>
          <div className="text-xl font-black text-amber-400 font-mono flex items-center justify-center gap-0.5">
            <span>{activeGame.stats.overallWinRate}</span>
            <span className="text-xs font-bold">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
