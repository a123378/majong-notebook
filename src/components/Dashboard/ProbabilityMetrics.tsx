import React from 'react';
import { PieChart, Zap, ShieldAlert, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const ProbabilityMetrics: React.FC = () => {
  const { activeGame } = useGame();
  const { stats } = activeGame;

  const metrics = [
    {
      label: '本場自摸率',
      rate: stats.tsumoRate,
      icon: <Award size={14} className="text-amber-500" />,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
    },
    {
      label: '本場胡牌率',
      rate: stats.winRate,
      icon: <Zap size={14} className="text-emerald-500" />,
      barColor: 'bg-emerald-500',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
    },
    {
      label: '本場放槍率',
      rate: stats.dealInRate,
      icon: <ShieldAlert size={14} className="text-rose-500" />,
      barColor: 'bg-rose-500',
      textColor: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <PieChart size={15} className="text-emerald-500" />
          <span>機率統計 (戰術分析)</span>
        </div>
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          基於 {stats.totalRounds} 局數據
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <span className={`text-sm font-black font-mono ${item.textColor}`}>
                {item.rate}%
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${item.barColor}`}
                style={{ width: `${Math.min(100, Math.max(item.rate > 0 ? 5 : 0, item.rate))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
