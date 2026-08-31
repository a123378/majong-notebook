import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  Share2,
  ChevronDown,
  ChevronUp,
  Download,
  Trophy,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameSession } from '../../types/mahjong';
import { BattleShareCard } from './BattleShareCard';
import { playTileClickSound } from '../../services/sound';

export const HistoryView: React.FC = () => {
  const { historySessions, deleteHistorySession } = useGame();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [sharingSession, setSharingSession] = useState<GameSession | null>(null);

  // Aggregate All-Time Stats
  const totalGames = historySessions.length;
  let totalNetAmount = 0;
  let totalRoundsAll = 0;
  let totalTsumoAll = 0;
  let totalWinAll = 0;
  let totalDealInAll = 0;

  for (const s of historySessions) {
    totalNetAmount += s.netAmount;
    totalRoundsAll += s.stats.totalRounds;
    totalTsumoAll += s.stats.tsumoCount;
    totalWinAll += s.stats.winCount;
    totalDealInAll += s.stats.dealInCount;
  }

  const overallWinRate =
    totalRoundsAll > 0
      ? (((totalTsumoAll + totalWinAll) / totalRoundsAll) * 100).toFixed(1)
      : '0.0';

  const isTotalPositive = totalNetAmount > 0;
  const isTotalNegative = totalNetAmount < 0;

  const toggleExpand = (id: string) => {
    playTileClickSound();
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  const handleExportJSON = () => {
    playTileClickSound();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(historySessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mahjong_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
      .getDate()
      .toString()
      .padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 總體戰績統計 Hero Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
              歷史戰績總覽
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            共完成 {totalGames} 場雀局
          </span>
        </div>

        {/* All-time Net Amount */}
        <div className="my-2 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">歷史累積總盈虧</span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-black ${
                isTotalPositive ? 'text-emerald-400' : isTotalNegative ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {isTotalPositive ? '+' : isTotalNegative ? '-' : ''}$
            </span>
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isTotalPositive
                  ? 'text-emerald-400'
                  : isTotalNegative
                  ? 'text-rose-400'
                  : 'text-slate-100'
              }`}
            >
              {Math.abs(totalNetAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* All-time secondary stats */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總局數</span>
            <span className="text-sm font-black font-mono text-white">{totalRoundsAll} 局</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總勝率</span>
            <span className="text-sm font-black font-mono text-emerald-400">{overallWinRate}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總自摸</span>
            <span className="text-sm font-black font-mono text-amber-400">{totalTsumoAll} 次</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總放槍</span>
            <span className="text-sm font-black font-mono text-rose-400">{totalDealInAll} 次</span>
          </div>
        </div>
      </div>

      {/* Export & Action Controls */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          雀局歷史列表 ({historySessions.length})
        </h3>
        {historySessions.length > 0 && (
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
          >
            <Download size={13} />
            <span>匯出 JSON 備份</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      {historySessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-3 flex items-center justify-center text-3xl">
            📜
          </div>
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            尚無歷史戰績
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            當您在記帳主頁點擊「結束本場並開新局」後，戰局將自動歸檔並統計在此處。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historySessions.map((session) => {
            const isExpanded = expandedSessionId === session.id;
            const isPositive = session.netAmount > 0;
            const isNegative = session.netAmount < 0;

            return (
              <div
                key={session.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all overflow-hidden"
              >
                {/* Session Card Header */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                        {session.title || '麻將雀局'}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                        底{session.base}/台{session.taiPrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {formatDateTime(session.startTime)}
                      </span>
                      <span>·</span>
                      <span>{session.stats.totalRounds} 局</span>
                      <span>·</span>
                      <span className="text-amber-500 font-bold">
                        自摸 {session.stats.tsumoCount} 次
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Net Profit & Expand Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div
                      className={`text-right font-mono font-black text-lg sm:text-xl ${
                        isPositive
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : isNegative
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isPositive ? `+$${session.netAmount}` : isNegative ? `-$${Math.abs(session.netAmount)}` : '$0'}
                    </div>

                    <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expandable Session Detail & Round-by-round breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {/* Session Statistics Bar */}
                    <div className="grid grid-cols-4 gap-1.5 py-3 text-center border-b border-slate-200 dark:border-slate-800 mb-3 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">胡牌</span>
                        <span className="font-bold text-emerald-500 font-mono">
                          {session.stats.winCount} 次 ({session.stats.winRate}%)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">放槍</span>
                        <span className="font-bold text-rose-500 font-mono">
                          {session.stats.dealInCount} 次 ({session.stats.dealInRate}%)
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">被自摸</span>
                        <span className="font-bold text-orange-500 font-mono">
                          {session.stats.tsumoLossCount} 次
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block">綜合勝率</span>
                        <span className="font-bold text-amber-500 font-mono">
                          {session.stats.overallWinRate}%
                        </span>
                      </div>
                    </div>

                    {/* Round-by-round Detailed Ledger */}
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      單局明細與精確算法
                    </h5>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {session.rounds.map((r, rIdx) => (
                        <div
                          key={r.id || rIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold">
                              <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] flex items-center justify-center font-mono font-bold">
                                {session.rounds.length - rIdx}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200">
                                {r.formattedFormula}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono ml-6 block">
                              {new Date(r.timestamp).toLocaleTimeString('zh-TW')}
                            </span>
                          </div>

                          <span
                            className={`font-mono font-black ${
                              r.amount > 0
                                ? 'text-emerald-500'
                                : r.amount < 0
                                ? 'text-rose-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {r.amount > 0 ? `+$${r.amount}` : r.amount < 0 ? `-$${Math.abs(r.amount)}` : '$0'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTileClickSound();
                          setSharingSession(session);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-all"
                      >
                        <Share2 size={13} />
                        <span>戰報卡片</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('確定要永久刪除此場戰績紀錄嗎？')) {
                            deleteHistorySession(session.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-xs hover:bg-rose-100 transition-all"
                      >
                        <Trash2 size={13} />
                        <span>刪除</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Battle Share Modal */}
      {sharingSession && (
        <BattleShareCard
          session={sharingSession}
          onClose={() => setSharingSession(null)}
        />
      )}
    </div>
  );
};
