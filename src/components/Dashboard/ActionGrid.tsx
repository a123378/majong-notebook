import React from 'react';
import { Sparkles, Target, Flame, DollarSign, Handshake } from 'lucide-react';
import { RoundActionType } from '../../types/mahjong';
import { playTileClickSound } from '../../services/sound';

interface ActionGridProps {
  onSelectAction: (action: RoundActionType) => void;
  onQuickDraw: () => void;
}

export const ActionGrid: React.FC<ActionGridProps> = ({ onSelectAction, onQuickDraw }) => {
  const handleClick = (action: RoundActionType) => {
    playTileClickSound();
    if (action === 'draw') {
      onQuickDraw();
    } else {
      onSelectAction(action);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" />
          <span>快速記帳操作</span>
        </h3>
        <span className="text-[11px] text-slate-600 dark:text-slate-400">點擊按鈕進入輸入</span>
      </div>

      {/* Main 4 Action Buttons Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* 胡 牌 */}
        <button
          type="button"
          onClick={() => handleClick('win')}
          className="group relative overflow-hidden flex items-center justify-center py-5 sm:py-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all duration-150"
        >
          <div className="flex items-center gap-2 z-10">
            <span className="text-3xl">🀄</span>
            <span className="text-2xl font-black tracking-widest">胡牌</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:bg-white/20 transition-colors" />
        </button>

        {/* 丟 槍 */}
        <button
          type="button"
          onClick={() => handleClick('dealIn')}
          className="group relative overflow-hidden flex items-center justify-center py-5 sm:py-6 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] text-white shadow-lg shadow-rose-600/25 border border-rose-400/30 transition-all duration-150"
        >
          <div className="flex items-center gap-2 z-10">
            <span className="text-3xl">🎯</span>
            <span className="text-2xl font-black tracking-widest">丟槍</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:bg-white/20 transition-colors" />
        </button>

        {/* 自 摸 */}
        <button
          type="button"
          onClick={() => handleClick('tsumo')}
          className="group relative overflow-hidden flex items-center justify-center py-5 sm:py-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-white shadow-lg shadow-amber-600/25 border border-amber-400/30 transition-all duration-150"
        >
          <div className="flex items-center gap-2 z-10">
            <span className="text-3xl">✨</span>
            <span className="text-2xl font-black tracking-widest">自摸</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:bg-white/20 transition-colors" />
        </button>

        {/* 被自摸 */}
        <button
          type="button"
          onClick={() => handleClick('tsumoLoss')}
          className="group relative overflow-hidden flex items-center justify-center py-5 sm:py-6 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 active:scale-[0.98] text-white shadow-lg shadow-orange-600/25 border border-orange-400/30 transition-all duration-150"
        >
          <div className="flex items-center gap-2 z-10">
            <span className="text-3xl">💥</span>
            <span className="text-2xl font-black tracking-widest">被自摸</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none group-hover:bg-white/20 transition-colors" />
        </button>
      </div>

      {/* Quick Action: Draw (流局) */}
      <button
        type="button"
        onClick={() => handleClick('draw')}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold active:scale-[0.98] hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all duration-150"
      >
        <span className="text-2xl">🤝</span>
        <span className="text-lg tracking-widest">和局 (流局)</span>
      </button>
    </div>
  );
};