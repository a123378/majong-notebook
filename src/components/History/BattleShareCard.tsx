import React, { useState, useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { GameSession } from '../../types/mahjong';
import { playTileClickSound } from '../../services/sound';

interface BattleShareCardProps {
  session: GameSession;
  onClose: () => void;
}

export const BattleShareCard: React.FC<BattleShareCardProps> = ({ session, onClose }) => {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isPositive = session.netAmount > 0;
  const isNegative = session.netAmount < 0;

  const dateStr = new Date(session.startTime).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const getShareText = () => {
    const profitText = isPositive
      ? `+ $${session.netAmount}`
      : isNegative
      ? `- $${Math.abs(session.netAmount)}`
      : '$0';
    return `🀄【麻將紀錄】今日戰報 🀄\n📅 日期：${dateStr}\n💰 規格：底 ${session.base} / 台 ${session.taiPrice}\n📊 總局數：${session.stats.totalRounds} 局\n🏆 總盈虧：${profitText}\n✨ 戰績：自摸 ${session.stats.tsumoCount} 次 (${session.stats.tsumoRate}%) | 胡牌 ${session.stats.winCount} 次 | 放槍 ${session.stats.dealInCount} 次\n🔥 勝率：${session.stats.overallWinRate}%\n#麻將紀錄 #麻將PWA`;
  };

  const handleCopyText = () => {
    playTileClickSound();
    navigator.clipboard.writeText(getShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-all z-20"
        >
          <X size={18} />
        </button>

        {/* Visual Share Card Box */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-2xl mb-4 text-center"
        >
          {/* Top Logo */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-1">
              <img src="./favicon.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-sm text-emerald-400 tracking-wider">
              麻將紀錄 · 戰報結算
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono mb-4">
            {dateStr} · 底 {session.base} / 台 {session.taiPrice}
          </p>

          {/* Big Amount */}
          <div className="my-3 py-3 rounded-2xl bg-black/40 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">本場結算盈虧</span>
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`text-2xl font-black ${
                  isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {isPositive ? '+' : isNegative ? '-' : ''}$
              </span>
              <span
                className={`text-4xl font-black font-mono tracking-tight ${
                  isPositive
                    ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]'
                    : isNegative
                    ? 'text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]'
                    : 'text-slate-200'
                }`}
              >
                {Math.abs(session.netAmount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">總局數</span>
              <span className="text-sm font-black font-mono text-white">
                {session.stats.totalRounds} 局
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">自摸次數</span>
              <span className="text-sm font-black font-mono text-amber-400">
                {session.stats.tsumoCount} 次
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">綜合勝率</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                {session.stats.overallWinRate}%
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Powered by 麻將紀錄 PWA
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-bold text-sm shadow-md transition-all"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? '戰報文字已複製到剪貼簿！' : '複製戰報文字分享'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
