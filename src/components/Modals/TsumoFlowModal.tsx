import React, { useState } from 'react';
import { Crown, User, ArrowRight, X, Sparkles, ChevronLeft } from 'lucide-react';
import { playTileClickSound } from '../../services/sound';

interface TsumoFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToNumpad: (isDealer: boolean, streakCount: number) => void;
}

export const TsumoFlowModal: React.FC<TsumoFlowModalProps> = ({
  isOpen,
  onClose,
  onProceedToNumpad,
}) => {
  const [step, setStep] = useState<'dealerCheck' | 'streakInput'>('dealerCheck');
  const [streakCount, setStreakCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleDealerChoice = (isDealer: boolean) => {
    playTileClickSound();
    if (isDealer) {
      // 自己是莊家 -> 直接進入台數鍵盤
      onProceedToNumpad(true, 0);
      handleReset();
    } else {
      // 非莊家 -> 進入連莊數詢問
      setStep('streakInput');
    }
  };

  const handleStreakConfirm = () => {
    playTileClickSound();
    onProceedToNumpad(false, streakCount);
    handleReset();
  };

  const handleReset = () => {
    setStep('dealerCheck');
    setStreakCount(0);
    onClose();
  };

  const extraTai = 2 * streakCount + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
        >
          <X size={18} />
        </button>

        {/* STEP 1: 自己是否為莊家？ */}
        {step === 'dealerCheck' && (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 mx-auto mb-4 flex items-center justify-center text-2xl shadow-inner">
              🀄
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
              恭喜自摸！
            </h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6">
              請問這局「自己是否為莊家」？
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* 是 (莊家) */}
              <button
                type="button"
                onClick={() => handleDealerChoice(true)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-white font-bold shadow-lg shadow-amber-500/25 transition-all"
              >
                <Crown size={28} className="mb-2 stroke-[2.5]" />
                <span className="text-base">是 (我是莊家)</span>
                <span className="text-[11px] text-amber-100 font-normal mt-0.5">三家收取同額</span>
              </button>

              {/* 否 (閒家) */}
              <button
                type="button"
                onClick={() => handleDealerChoice(false)}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 active:scale-95 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              >
                <User size={28} className="mb-2 text-slate-500 dark:text-slate-400 stroke-[2.5]" />
                <span className="text-base">否 (我是閒家)</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-normal mt-0.5">計算別人連莊台</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: 別人連多少莊？ */}
        {step === 'streakInput' && (
          <div className="text-center py-1">
            <button
              onClick={() => setStep('dealerCheck')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-2 transition-all"
            >
              <ChevronLeft size={14} />
              <span>返回上一步</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 mx-auto mb-3 flex items-center justify-center">
              <Sparkles size={24} />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              請問別人連多少莊？
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              若當前莊家沒有連莊請選擇「0」
            </p>

            {/* Quick Streak Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    playTileClickSound();
                    setStreakCount(n);
                  }}
                  className={`py-2.5 px-2 rounded-xl text-sm font-bold border transition-all ${
                    streakCount === n
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {n === 0 ? '0 (沒連莊)' : `連 ${n} 莊`}
                </button>
              ))}
            </div>

            {/* Live Formula Display */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mb-5 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                <span>莊家額外台數公式 (2N + 1)</span>
                <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  +{extraTai} 台
                </span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400/80">
                {streakCount === 0
                  ? '莊家沒連莊：莊家需多付 2×0 + 1 = 1 台'
                  : `莊家連 ${streakCount} 莊：莊家需多付 2×${streakCount} + 1 = ${extraTai} 台`}
              </p>
            </div>

            {/* Proceed Button */}
            <button
              type="button"
              onClick={handleStreakConfirm}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <span>進入台數輸入</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
