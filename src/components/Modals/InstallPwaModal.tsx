import React from 'react';
import { Download, X, Share, PlusSquare, CheckCircle } from 'lucide-react';
import { usePwa } from '../../context/PwaContext';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwa();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (success) {
      onClose();
    }
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

        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-2 text-white mx-auto mb-3 shadow-lg shadow-emerald-700/25 flex items-center justify-center">
            <img src="./favicon.svg" alt="App Logo" className="w-full h-full object-contain" />
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
            安裝「麻將紀錄」PWA
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            享受類似原生 Native App 的全螢幕體驗與無縫離線快取
          </p>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-center mb-4">
            <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              應用程式已成功安裝！
            </h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-1">
              您隨時可以從電腦桌面或手機主畫面直接開啟全螢幕「麻將紀錄」。
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            {/* Install Highlights */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="text-base mb-1 block">🚀</span>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  隱藏網址列
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  全螢幕乾淨操作介面
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="text-base mb-1 block">⚡</span>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                  斷網離線可用
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  牌桌無訊號照常記帳
                </span>
              </div>
            </div>

            {/* Direct Install Button for Android / Chrome / Desktop */}
            {isInstallable && !isIOS && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-black text-base shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Download size={18} className="stroke-[3]" />
                <span>立即安裝到主畫面 / 桌面</span>
              </button>
            )}

            {/* iOS Safari Guide */}
            {isIOS && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  📱 iPhone / iPad (Safari) 安裝步驟：
                </span>

                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                    1
                  </div>
                  <div className="flex items-center gap-1">
                    <span>點擊 Safari 底部的</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold">
                      <Share size={11} className="mr-1" /> 分享
                    </span>
                    <span>圖示</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-1">
                    <span>向下滾動並點選</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold">
                      <PlusSquare size={11} className="mr-1" /> 加入主畫面
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                    3
                  </div>
                  <span>點擊右上角「新增」即完成安裝！</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          關閉
        </button>
      </div>
    </div>
  );
};
