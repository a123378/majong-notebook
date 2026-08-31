import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Copy,
  Check,
  Database,
  Cloud,
  Layers,
} from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { playTileClickSound } from '../../services/sound';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    isOnline,
    isSyncing,
    queueCount,
    lastSyncedAt,
    config,
    updateCloudConfig,
    joinRoom,
    createNewRoom,
    leaveRoom,
    triggerSync,
  } = useSync();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdvancedBaaS, setShowAdvancedBaaS] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseAnonKey || '');

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!inputCode.trim()) return;
    playTileClickSound();
    await joinRoom(inputCode);
    setInputCode('');
  };

  const handleCreate = async () => {
    playTileClickSound();
    await createNewRoom();
  };

  const handleCopyCode = () => {
    if (!config.roomCode) return;
    navigator.clipboard.writeText(config.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBaaS = async () => {
    playTileClickSound();
    await updateCloudConfig({
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseKey.trim(),
    });
    alert('已成功更新 Supabase BaaS 配置！');
  };

  const formatLastSync = (ts?: number) => {
    if (!ts) return '尚未同步';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Cloud size={20} className="text-emerald-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              雲端資料庫與跨裝置同步
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Network & Sync Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between ${
            !isOnline
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              : config.enabled && config.roomCode
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {!isOnline ? (
              <WifiOff size={20} className="text-amber-500" />
            ) : (
              <Wifi size={20} className="text-emerald-500" />
            )}
            <div>
              <span className="text-xs font-bold block">
                {!isOnline
                  ? '離線模式 (離線優先 IndexedDB 暫存中)'
                  : config.enabled && config.roomCode
                  ? `已連線至房間: ${config.roomCode}`
                  : '未連線 (目前為本地單機模式)'}
              </span>
              <span className="text-[11px] opacity-80">
                上次同步時間：{formatLastSync(lastSyncedAt)}
              </span>
            </div>
          </div>

          <button
            onClick={triggerSync}
            disabled={isSyncing || !isOnline}
            title="立即手動同步"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin text-emerald-500' : ''} />
          </button>
        </div>

        {/* Offline Queue Badge Notification */}
        {queueCount > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mb-4 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Layers size={15} />
              <span>
                尚有 <strong>{queueCount}</strong> 筆離線數據暫存於本地
              </span>
            </div>
            <span className="text-[11px] opacity-80">連線後將自動上傳並清除快取</span>
          </div>
        )}

        {/* SECTION 1: 專屬房間代碼同步 */}
        <div className="mb-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            1. 專屬房間代碼同步 (手機與電腦即時連動)
          </span>

          {config.enabled && config.roomCode ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-xs text-slate-600 dark:text-slate-400 block mb-1">當前專屬房間代碼</span>
              <div className="text-3xl font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                {config.roomCode}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all shadow-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? '代碼已複製！' : '複製房間代碼'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => leaveRoom()}
                  className="py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-all"
                >
                  離開房間
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="輸入 6 碼房間代碼 (如 MJ-8899)"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleJoin}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
                >
                  加入房間
                </button>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-400">或者</span>
              </div>

              <button
                type="button"
                onClick={handleCreate}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
              >
                + 建立全新房間代碼
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: 整合輕量級 BaaS (Supabase / Firebase) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvancedBaaS(!showAdvancedBaaS)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-1"
          >
            <span className="flex items-center gap-1.5">
              <Database size={14} className="text-emerald-500" />
              <span>進階 BaaS 自訂後端 (Supabase / Firestore)</span>
            </span>
            <span className="text-[10px] text-slate-400">{showAdvancedBaaS ? '收合 ▲' : '展開 ▼'}</span>
          </button>

          {showAdvancedBaaS && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Supabase Anon Key (公開金鑰)
                </label>
                <input
                  type="password"
                  placeholder="eyJh..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveBaaS}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs shadow-sm transition-all"
              >
                儲存 BaaS 設定
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
