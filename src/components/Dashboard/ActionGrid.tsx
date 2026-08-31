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
        <span className="text-[11px] text-slate-600 dark:text-slate-400">點擊按鈕開啟輸入</span>
      </div>

      {/* Main 4 Action Buttons Grid (2x2) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* 🎉 胡牌 */}
        <button
          type="button"
          onClick={() => handleClick('win')}
          className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.98] text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all duration-150"
        >
          <div className="flex flex-col items-start z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl">🎉</span>
              <span className="text-xl font-black tracking-wide">胡牌</span>
            </div>
            <span className="text-xs text-emerald-100 font-medium">+ (底 + 台數×台價)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm z-10 transition-transform group-hover:scale-110">
            <Target size={20} className="text-white" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
        </button>

        {/* 🀄 自摸 */}
        <button
          type="button"
          onClick={() => handleClick('tsumo')}
          className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-white shadow-lg shadow-amber-600/25 border border-amber-400/30 transition-all duration-150"
        >
          <div className="flex flex-col items-start z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl">🀄</span>
              <span className="text-xl font-black tracking-wide">自摸</span>
            </div>
            <span className="text-xs text-amber-100 font-medium">莊家/連莊三家通收</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm z-10 transition-transform group-hover:scale-110">
            <Flame size={20} className="text-white" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
        </button>

        {/* 🔫 放槍 */}
        <button
          type="button"
          onClick={() => handleClick('dealIn')}
          className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-[0.98] text-white shadow-lg shadow-rose-600/25 border border-rose-400/30 transition-all duration-150"
        >
          <div className="flex flex-col items-start z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl">🔫</span>
              <span className="text-xl font-black tracking-wide">放槍</span>
            </div>
            <span className="text-xs text-rose-100 font-medium">- (底 + 台數×台價)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm z-10 transition-transform group-hover:scale-110">
            <span className="text-lg font-black font-mono">-1</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
        </button>

        {/* 💸 被自摸 */}
        <button
          type="button"
          onClick={() => handleClick('tsumoLoss')}
          className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 active:scale-[0.98] text-white shadow-lg shadow-orange-600/25 border border-orange-400/30 transition-all duration-150"
        >
          <div className="flex flex-col items-start z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-2xl">💸</span>
              <span className="text-xl font-black tracking-wide">被自摸</span>
            </div>
            <span className="text-xs text-orange-100 font-medium">- 支付一家金額</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm z-10 transition-transform group-hover:scale-110">
            <DollarSign size={20} className="text-white" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-md pointer-events-none" />
        </button>
      </div>

      {/* 🤝 流局沒事 Full Width Button */}
      <button
        type="button"
        onClick={() => handleClick('draw')}
        className="w-full flex items-center justify-between py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 shadow-sm active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🤝</span>
          <div className="text-left">
            <span className="font-bold text-sm block">流局沒事</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">金額 $0 / 總局數 +1</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          <Handshake size={14} />
          <span>一鍵記錄</span>
        </div>
      </button>
    </div>
  );
};
