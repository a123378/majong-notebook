import React from 'react';
import { RotateCcw, ListFilter, Clock } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { RoundRecord } from '../../types/mahjong';

interface CurrentRoundLedgerProps {
  onSelectRound?: (round: RoundRecord) => void;
}

export const CurrentRoundLedger: React.FC<CurrentRoundLedgerProps> = () => {
  const { activeGame, undoLastRound } = useGame();
  const { rounds } = activeGame;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'win':
        return { label: '胡牌', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: '🎉' };
      case 'tsumo':
        return { label: '自摸', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: '🀄' };
      case 'dealIn':
        return { label: '放槍', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30', icon: '🔫' };
      case 'tsumoLoss':
        return { label: '被自摸', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30', icon: '💸' };
      case 'draw':
        return { label: '流局', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30', icon: '🤝' };
      default:
        return { label: '紀錄', color: 'bg-slate-500/15 text-slate-600', icon: '🀄' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ListFilter size={15} className="text-emerald-500" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            本場每局明細 ({rounds.length} 局)
          </h3>
        </div>

        {rounds.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('確定要撤銷上一局紀錄嗎？')) {
                undoLastRound();
              }
            }}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 active:scale-95 transition-all"
          >
            <RotateCcw size={12} />
            <span>撤銷上一局</span>
          </button>
        )}
      </div>

      {/* Rounds List */}
      {rounds.length === 0 ? (
        <div className="py-8 text-center text-slate-600 dark:text-slate-400">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-2 flex items-center justify-center text-2xl">
            🀄
          </div>
          <p className="text-xs font-medium">尚未開始記帳，點擊上方按鈕記錄第一局！</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1">
          {rounds.map((r, index) => {
            const badge = getActionBadge(r.actionType);
            const isProfit = r.amount > 0;
            const isLoss = r.amount < 0;

            return (
              <div
                key={r.id || index}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {/* Left: Round & Action */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700/70 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    {rounds.length - index}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${badge.color}`}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                        {r.actionType !== 'draw' && (
                          <span className="font-mono">{r.taiCount}台</span>
                        )}
                      </span>

                      {/* Tsumo Streak Badge if applicable */}
                      {r.tsumoDetails && !r.tsumoDetails.isDealer && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {r.tsumoDetails.streakCount === 0 ? '莊+1台' : `連${r.tsumoDetails.streakCount}莊(+${r.tsumoDetails.dealerExtraTai}台)`}
                        </span>
                      )}

                      {/* Custom Tags */}
                      {r.tags && r.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 truncate max-w-[200px] sm:max-w-xs" title={r.formattedFormula}>
                      {r.formattedFormula}
                    </div>
                  </div>
                </div>

                {/* Right: Net Amount & Time */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={`font-mono font-black text-sm sm:text-base ${
                      isProfit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isLoss
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {isProfit ? `+$${r.amount}` : isLoss ? `-$${Math.abs(r.amount)}` : '$0'}
                  </div>

                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
                    <Clock size={10} />
                    <span>{formatTime(r.timestamp)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
