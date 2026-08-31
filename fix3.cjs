const fs = require('fs');
let file = fs.readFileSync('src/components/Modals/SettingsModal.tsx', 'utf8');

// Replace everything between {/* Sound Effects */} and {/* PWA Installation Card */} 
file = file.replace(
  /\{\/\* Sound Effects \*\/\}[\s\S]*?\{\/\* PWA Installation Card \*\/\}/,
  `{/* Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              {soundOn ? <Volume2 size={18} className="text-emerald-500" /> : <VolumeX size={18} className="text-slate-400" />}
              <div>
                <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">麻將點擊反饋音效</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">
                  {soundOn ? '已啟用 Web Audio 音效' : '已關閉'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={\`px-3 py-1.5 rounded-xl font-bold text-xs transition-all \${
                soundOn
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }\`}
            >
              {soundOn ? '開啟' : '關閉'}
            </button>
          </div>

          {/* PWA Installation Card */}`
);

fs.writeFileSync('src/components/Modals/SettingsModal.tsx', file, 'utf8');