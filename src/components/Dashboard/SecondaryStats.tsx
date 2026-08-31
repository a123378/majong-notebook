import React from 'react';
import { useGame } from '../../context/GameContext';

export const SecondaryStats: React.FC = () => {
  const { activeGame } = useGame();
  const { stats } = activeGame;

  const items = [
    {
      label: '自摸',
      count: stats.tsumoCount,
      icon: '🀄',
      color: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-300',
    },
    {
      label: '胡牌',
      count: stats.winCount,
      icon: '🎉',
      color: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300',
    },
    {
      label: '放槍',
      count: stats.dealInCount,
      icon: '🔫',
      color: 'text-rose-500 dark:text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      badge: 'bg-rose-500/20 text-rose-600 dark:text-rose-300',
    },
    {
      label: '被自摸',
      count: stats.tsumoLossCount,
      icon: '💸',
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      badge: 'bg-orange-500/20 text-orange-600 dark:text-orange-300',
    },
    {
      label: '流局',
      count: stats.drawCount,
      icon: '🤝',
      color: 'text-slate-500 dark:text-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/20',
      badge: 'bg-slate-500/20 text-slate-600 dark:text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all ${item.bg}`}
        >
          <span className="text-base sm:text-lg mb-0.5">{item.icon}</span>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
            {item.label}
          </span>
          <span className={`text-base sm:text-lg font-black font-mono mt-0.5 ${item.color}`}>
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
};
