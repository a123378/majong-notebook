import React, { useState } from 'react';
import {
  X,
  Sliders,
  Volume2,
  VolumeX,
  Wifi,
  Download,
  Flag,
  RotateCcw,
  Check,
  Smartphone,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePwa } from '../../context/PwaContext';
import { useSync } from '../../context/SyncContext';
import { DEFAULT_PRESETS } from '../../types/mahjong';
import { getSoundEnabled, setSoundEnabled, playTileClickSound } from '../../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEndGame: () => void;
  onOpenSync: () => void;
  onOpenInstall: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenEndGame,
  onOpenSync,
  onOpenInstall,
}) => {
  const { activeGame, setBaseAndTai, resetCurrentGame } = useGame();
  const { isInstallable, isInstalled } = usePwa();
  const { config } = useSync();

  const [baseInput, setBaseInput] = useState<string>(activeGame.base.toString());
  const [taiInput, setTaiInput] = useState<string>(activeGame.taiPrice.toString());
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (base: number, taiPrice: number) => {
    playTileClickSound();
    setBaseInput(base.toString());
    setTaiInput(taiPrice.toString());
  };

  const handleSaveBaseTai = async () => {
    playTileClickSound();
    const base = Math.max(1, parseInt(baseInput, 10) || 50);
    const tai = Math.max(1, parseInt(taiInput, 10) || 20);
    await setBaseAndTai(base, tai);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTileClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-emerald-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              遊戲與系統設定
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION 1: 金額設定 (雀局規格) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              雀局底台金額設定
            </span>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                <Check size={13} /> 已儲存
              </span>
            )}
          </div>

          {/* Quick Presets Grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {DEFAULT_PRESETS.map((p) => {
              const isActive =
                parseInt(baseInput, 10) === p.base && parseInt(taiInput, 10) === p.taiPrice;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.base, p.taiPrice)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  底{p.base}/台{p.taiPrice}
                </button>
              );
            })}
          </div>

          {/* Custom Base and Tai Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                自訂底價 ($)
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                自訂台價 ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={taiInput}
                onChange={(e) => setTaiInput(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveBaseTai}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs transition-all shadow-sm"
          >
            套用規格設定
          </button>
        </div>

        {/* SECTION 2: 系統與外觀 */}
        <div className="mb-5 space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            外觀與系統控制
          </span>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              {soundOn ? <Volume2 size={18} className="text-emerald-500" /> : <VolumeX size={18} className="text-slate-400" />}
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">麻將落子與勝負音效</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {soundOn ? '已開啟 Web Audio 原生音效' : '已靜音'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                soundOn
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {soundOn ? '開' : '關'}
            </button>
          </div>

          {/* Cloud Room Sync */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              <Wifi size={18} className={config.enabled ? 'text-emerald-500' : 'text-slate-400'} />
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  雲端跨裝置同步
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {config.enabled && config.roomCode
                    ? `房間: ${config.roomCode}`
                    : '未連線 (離線儲存中)'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSync();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-all"
            >
              房間設定
            </button>
          </div>

          {/* PWA Installation Card */}
          {(!isInstalled || isInstallable) && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                    安裝至桌面或手機
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    全螢幕 App 體驗、離線極速載入
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
              >
                <Download size={13} />
                <span>安裝</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3: 結算與重置 */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            雀局結算與管理
          </span>

          {/* 🏁 結束本場並開新局 */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenEndGame();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Flag size={16} />
            <span>🏁 結束本場並開新局 (結算歸檔)</span>
          </button>

          {/* 🔄 重置本場數據 */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('確定要直接清空重置當前戰局嗎？（不會歸檔至歷史紀錄）')) {
                resetCurrentGame();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all"
          >
            <RotateCcw size={14} />
            <span>重置本場所有數據 (歸零)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
