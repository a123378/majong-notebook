import React from 'react';
import { Trophy, CheckCircle, X, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface EndGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isOpen,
  onClose,
  onViewHistory,
}) => {
  const { activeGame, finishAndArchiveGame } = useGame();
  const { stats, netAmount, rounds } = activeGame;

  if (!isOpen) return null;

  const isPositive = netAmount > 0;
  const isNegative = netAmount < 0;

  // Generate MVP Title
  const getMVPTitle = () => {
    if (netAmount > 500) return '雀壇傳說 (狂贏大殺四方)';
    if (netAmount > 0) return '雀神附體 (穩健獲利)';
    if (stats.tsumoCount >= 3) return '自摸狂魔 (手氣極佳)';
    if (stats.dealInCount === 0 && rounds.length > 3) return '鐵壁防守 (零放槍)';
    if (netAmount < -300) return '逆風再戰 (下一場贏回來)';
    return '精彩雀局 (圓滿完賽)';
  };

  const handleConfirmEndGame = async () => {
    await finishAndArchiveGame();
    onClose();
    onViewHistory();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white mx-auto mb-3 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Trophy size={28} className="stroke-[2.5]" />
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
            本場戰局結算
          </h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold">
            <Sparkles size={13} />
            <span>{getMVPTitle()}</span>
          </div>
        </div>

        {/* Hero Money Box */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center mb-4 shadow-inner">
          <span className="text-xs font-medium text-slate-300 block mb-1">本場總盈虧</span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-black ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {isPositive ? '+' : isNegative ? '-' : ''}$
            </span>
            <span
              className={`text-4xl font-black font-mono tracking-tight ${
                isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {Math.abs(netAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5 text-left">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">總打局數</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
              {stats.totalRounds} <span className="text-xs font-normal">局</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">綜合勝率</span>
            <span className="text-base font-black text-amber-500 font-mono">
              {stats.overallWinRate}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">自摸次數</span>
            <span className="text-base font-black text-amber-500 font-mono">
              {stats.tsumoCount} 次 ({stats.tsumoRate}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">胡牌次數</span>
            <span className="text-base font-black text-emerald-500 font-mono">
              {stats.winCount} 次 ({stats.winRate}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">放槍次數</span>
            <span className="text-base font-black text-rose-500 font-mono">
              {stats.dealInCount} 次 ({stats.dealInRate}%)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">底台規格</span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 font-mono">
              底 {activeGame.base} / 台 {activeGame.taiPrice}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleConfirmEndGame}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all"
          >
            <CheckCircle size={18} />
            <span>結束並開新局 (歸檔至歷史紀錄)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
          >
            繼續記帳 (返回本場)
          </button>
        </div>
      </div>
    </div>
  );
};
