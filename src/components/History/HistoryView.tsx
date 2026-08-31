import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { GameSession, RoundActionType } from '../../types/mahjong';
import { Trophy, Clock, Trash2, ChevronDown, ChevronUp, Download } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { historySessions, deleteHistorySession } = useGame();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const toggleSession = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) next.delete(monthKey);
      else next.add(monthKey);
      return next;
    });
  };

  const totalGames = historySessions.length;
  const totalNetAmount = historySessions.reduce((sum, s) => sum + s.netAmount, 0);
  const totalRoundsAll = historySessions.reduce((sum, s) => sum + s.stats.totalRounds, 0);
  const totalWinAll = historySessions.reduce((sum, s) => sum + s.stats.winCount, 0);
  const totalTsumoAll = historySessions.reduce((sum, s) => sum + s.stats.tsumoCount, 0);
  const totalDealInAll = historySessions.reduce((sum, s) => sum + s.stats.dealInCount, 0);

  const overallWinRate = totalRoundsAll > 0 ? ((totalWinAll / totalRoundsAll) * 100).toFixed(1) : '0.0';
  const isTotalPositive = totalNetAmount > 0;
  const isTotalNegative = totalNetAmount < 0;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(historySessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mahjong_backup_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  // Group by Month, then by Day
  const groupedData = useMemo(() => {
    const result: Record<string, Record<string, GameSession[]>> = {};
    historySessions.forEach(session => {
      const d = new Date(session.startTime);
      const monthKey = `${d.getFullYear()}年${d.getMonth() + 1}月`;
      const dayKey = `${d.getMonth() + 1}月${d.getDate()}日`;
      
      if (!result[monthKey]) result[monthKey] = {};
      if (!result[monthKey][dayKey]) result[monthKey][dayKey] = [];
      
      result[monthKey][dayKey].push(session);
    });
    return result;
  }, [historySessions]);

  return (
    <div className="space-y-4 pb-12">
      {/* Hero Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              歷史戰績總覽
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            共完成 {totalGames} 場雀局
          </span>
        </div>

        <div className="my-2 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">歷史累積總盈虧</span>
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={`text-2xl font-black ${
                isTotalPositive ? 'text-emerald-500 dark:text-emerald-400' : isTotalNegative ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'
              }`}
            >
              {isTotalPositive ? '+' : isTotalNegative ? '-' : ''}$
            </span>
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isTotalPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isTotalNegative
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {Math.abs(totalNetAmount).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">總局數</span>
            <span className="text-sm font-black font-mono text-slate-800 dark:text-white">{totalRoundsAll} 局</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總勝率</span>
            <span className="text-sm font-black font-mono text-emerald-500 dark:text-emerald-400">{overallWinRate}%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總自摸</span>
            <span className="text-sm font-black font-mono text-amber-500 dark:text-amber-400">{totalTsumoAll} 次</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40">
            <span className="text-[10px] text-slate-400 block">總放槍</span>
            <span className="text-sm font-black font-mono text-rose-500 dark:text-rose-400">{totalDealInAll} 次</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          單局歷史列表 ({historySessions.length})
        </h3>
        {historySessions.length > 0 && (
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors text-xs"
          >
            <Download size={13} />
            <span>匯出 JSON 備份</span>
          </button>
        )}
      </div>

      {historySessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-3 flex items-center justify-center text-3xl">
            🀄
          </div>
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            尚無歷史戰績
          </h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            當您在記帳主頁點擊「結算本場並開新局」時，戰局將自動歸檔並統計於此。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedData)
            .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
            .map(([month, days]) => {
              const isMonthExpanded = expandedMonths.has(month);
              const monthTotalGames = Object.values(days).reduce((acc, curr) => acc + curr.length, 0);

              return (
                <div key={month} className="space-y-2">
                  <div
                    onClick={() => toggleMonth(month)}
                    className="flex items-center justify-between py-2 px-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <h3 className="text-sm font-black text-slate-600 dark:text-slate-300">
                      {month} <span className="text-xs font-normal text-slate-400">({monthTotalGames} 場)</span>
                    </h3>
                    <div className="text-slate-400">
                      {isMonthExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isMonthExpanded && (
                    <div className="space-y-4 pl-2 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                      {Object.entries(days)
                        .sort(([dayA], [dayB]) => dayB.localeCompare(dayA))
                        .map(([day, sessions]) => (
                          <div key={`${month}-${day}`} className="space-y-2 relative">
                            <div className="absolute -left-[14px] top-2 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-2">
                              {day}
                            </h4>

                            <div className="space-y-2.5">
                              {sessions.map(session => {
                                const isExpanded = expandedSessions.has(session.id);
                                const isPositive = session.netAmount > 0;
                                const isNegative = session.netAmount < 0;
                                const actionMap: Record<RoundActionType, string> = {
                                  win: '胡牌',
                                  dealIn: '放槍',
                                  tsumo: '自摸',
                                  tsumoLoss: '被自摸',
                                  draw: '和局'
                                };

                                return (
                                  <div
                                    key={session.id}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                                  >
                                    <div
                                      onClick={() => toggleSession(session.id)}
                                      className="p-3 sm:p-4 cursor-pointer flex items-center justify-between gap-2"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                                            {session.title || '麻將戰局'}
                                          </span>
                                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                                            底{session.base}/台{session.taiPrice}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                          <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span className="font-mono">{formatDateTime(session.startTime)}</span>
                                          </div>
                                          <span>·</span>
                                          <span>{session.stats.totalRounds} 局</span>
                                          <span>·</span>
                                          <span className="text-amber-500 font-bold">
                                            自摸 {session.stats.tsumoCount} 次
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end shrink-0 gap-1 pl-2">
                                        <div
                                          className={`font-black font-mono text-lg sm:text-xl ${
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

                                    {isExpanded && (
                                      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
                                        
                                        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
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

                                        </div>

                                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                          單局明細紀錄
                                        </h5>
                                        <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                          {session.rounds.map((r, i) => (
                                            <div
                                              key={r.id}
                                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-slate-400 w-6">
                                                  #{i + 1}
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                  {actionMap[r.actionType]} {r.taiCount > 0 ? `(${r.taiCount}台)` : ''}
                                                </span>
                                              </div>
                                              <span
                                                className={`text-sm font-black font-mono ${
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
                                          {session.rounds.length === 0 && (
                                            <div className="text-center py-4 text-slate-400 text-xs">
                                              無明細紀錄
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-4 flex gap-2">                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm('確定要永久刪除此場戰績嗎？(無法復原)')) {
                                                deleteHistorySession(session.id);
                                              }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold text-xs transition-colors"
                                          >
                                            <Trash2 size={13} />
                                            <span>刪除紀錄</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
