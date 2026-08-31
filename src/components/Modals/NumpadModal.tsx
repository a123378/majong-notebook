import React, { useState, useEffect } from 'react';
import { X, Delete, HelpCircle, Check, Bookmark } from 'lucide-react';
import { RoundActionType } from '../../types/mahjong';
import { useGame } from '../../context/GameContext';
import { calculateRound } from '../../services/calculations';
import { playTileClickSound } from '../../services/sound';

interface NumpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: RoundActionType;
  isDealer?: boolean;
  streakCount?: number;
  onOpenCheatSheet: () => void;
}

export const NumpadModal: React.FC<NumpadModalProps> = ({
  isOpen,
  onClose,
  actionType,
  isDealer = false,
  streakCount = 0,
  onOpenCheatSheet,
}) => {
  const { activeGame, addRound } = useGame();
  const [taiInput, setTaiInput] = useState<string>('1');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTaiInput('1');
      setSelectedTags([]);
      setNote('');
    }
  }, [isOpen, actionType]);

  if (!isOpen) return null;

  const currentTai = Math.max(0, parseInt(taiInput, 10) || 0);

  // Live calculation preview
  const previewRound = calculateRound({
    actionType,
    base: activeGame.base,
    taiPrice: activeGame.taiPrice,
    taiCount: currentTai,
    isDealer,
    streakCount,
    roundNumber: activeGame.rounds.length + 1,
  });

  const handleDigit = (digit: string) => {
    playTileClickSound();
    if (taiInput === '0' || taiInput === '') {
      setTaiInput(digit);
    } else if (taiInput.length < 3) {
      setTaiInput(taiInput + digit);
    }
  };

  const handleBackspace = () => {
    playTileClickSound();
    if (taiInput.length <= 1) {
      setTaiInput('0');
    } else {
      setTaiInput(taiInput.slice(0, -1));
    }
  };

  const handleQuickTai = (tai: number) => {
    playTileClickSound();
    setTaiInput(tai.toString());
  };

  const toggleTag = (tagName: string, tagTai: number) => {
    playTileClickSound();
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
      setTaiInput(Math.max(0, currentTai - tagTai).toString());
    } else {
      setSelectedTags([...selectedTags, tagName]);
      setTaiInput((currentTai + tagTai).toString());
    }
  };

  const handleConfirm = async () => {
    const round = calculateRound({
      actionType,
      base: activeGame.base,
      taiPrice: activeGame.taiPrice,
      taiCount: currentTai,
      isDealer,
      streakCount,
      tags: selectedTags,
      note: note.trim() || undefined,
      roundNumber: activeGame.rounds.length + 1,
    });

    onClose();
    // Fire and forget (or await in background) so UI doesn't block
    addRound(round).catch(console.error);
  };

  const getActionTheme = () => {
    switch (actionType) {
      case 'win':
        return {
          title: '胡牌記帳',
          icon: '🎉',
          color: 'text-emerald-500 dark:text-emerald-400',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
          btnGradient: 'from-emerald-500 to-emerald-600',
        };
      case 'tsumo':
        return {
          title: isDealer
            ? '莊家自摸記帳'
            : `自摸記帳 (閒家 / 連${streakCount}莊)`,
          icon: '🀄',
          color: 'text-amber-500 dark:text-amber-400',
          badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300',
          btnGradient: 'from-amber-500 to-amber-600',
        };
      case 'dealIn':
        return {
          title: '放槍記帳',
          icon: '🔫',
          color: 'text-rose-500 dark:text-rose-400',
          badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300',
          btnGradient: 'from-rose-500 to-rose-600',
        };
      case 'tsumoLoss':
        return {
          title: '被自摸記帳',
          icon: '💸',
          color: 'text-orange-500 dark:text-orange-400',
          badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-300',
          btnGradient: 'from-orange-500 to-orange-600',
        };
      default:
        return {
          title: '記帳',
          icon: '🀄',
          color: 'text-slate-500',
          badgeBg: 'bg-slate-500/15 text-slate-600',
          btnGradient: 'from-slate-600 to-slate-700',
        };
    }
  };

  const theme = getActionTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{theme.icon}</span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                {theme.title}
              </h3>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                底 ${activeGame.base} / 台 ${activeGame.taiPrice}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCheatSheet}
              title="台數速查表"
              className="p-2 rounded-full text-slate-500 hover:text-emerald-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-all"
            >
              <HelpCircle size={17} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Live Calculation Display Box */}
        <div className="my-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">牌型台數：</span>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {currentTai}
            </span>
            <span className="text-sm font-bold text-slate-500">台</span>
          </div>

          {/* Real-time money preview */}
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">結算金額：</span>
            <span
              className={`text-2xl font-black font-mono ${
                previewRound.amount > 0
                  ? 'text-emerald-500 dark:text-emerald-400'
                  : previewRound.amount < 0
                  ? 'text-rose-500 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {previewRound.amount > 0
                ? `+$${previewRound.amount}`
                : previewRound.amount < 0
                ? `-$${Math.abs(previewRound.amount)}`
                : '$0'}
            </span>
          </div>

          {/* Detailed formula breakdown */}
          <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 truncate px-2 font-mono">
            {previewRound.formattedFormula}
          </div>
        </div>

        {/* Quick Common Tags / Tai Adders */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 px-0.5">
            <span className="flex items-center gap-1">
              <Bookmark size={12} className="text-emerald-500" />
              <span>常用牌型快速加台</span>
            </span>
            <button
              onClick={onOpenCheatSheet}
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              更多牌型 →
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: '門清', tai: 1 },
              { name: '自摸', tai: 1 },
              { name: '平胡', tai: 2 },
              { name: '三暗刻', tai: 2 },
              { name: '碰碰胡', tai: 4 },
              { name: '混一色', tai: 4 },
              { name: '清一色', tai: 8 },
            ].map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name, tag.tai)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag.name} +{tag.tai}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1 ~ 8 Quick Tai Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((tai) => (
            <button
              key={tai}
              type="button"
              onClick={() => handleQuickTai(tai)}
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                currentTai === tai
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tai} 台
            </button>
          ))}
        </div>

        {/* 0-9 Numeric Keypad */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num.toString())}
              className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              playTileClickSound();
              setTaiInput('0');
            }}
            className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            歸零
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Confirm Submit Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r ${theme.btnGradient} hover:brightness-110 active:scale-[0.98] text-white font-black text-base shadow-lg flex items-center justify-center gap-2 transition-all`}
        >
          <Check size={20} className="stroke-[3]" />
          <span>
            確認記錄 (
            {previewRound.amount > 0
              ? `+$${previewRound.amount}`
              : previewRound.amount < 0
              ? `-$${Math.abs(previewRound.amount)}`
              : '$0'}
            )
          </span>
        </button>
      </div>
    </div>
  );
};
