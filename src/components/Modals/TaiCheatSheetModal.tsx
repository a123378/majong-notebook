import React, { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { TAI_CHEAT_SHEET } from '../../services/calculations';

interface TaiCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTai?: (tai: number, name: string) => void;
}

export const TaiCheatSheetModal: React.FC<TaiCheatSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectTai,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = TAI_CHEAT_SHEET.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-emerald-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              臺灣麻將台數速查表
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-2 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋牌型 (例: 碰碰胡, 門清, 清一色)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: '全部' },
              { id: 'basic', label: '基本牌型' },
              { id: 'medium', label: '中級牌型' },
              { id: 'advanced', label: '高級大牌' },
              { id: 'rare', label: '極罕見牌' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Tai Items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">找不到相關牌型</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectTai) {
                    onSelectTai(item.tai, item.name);
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500/50 cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="flex-shrink-0 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-mono font-black text-sm border border-emerald-200 dark:border-emerald-800">
                  {item.tai} 台
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
