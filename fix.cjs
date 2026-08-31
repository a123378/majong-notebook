const fs = require('fs');
let file = fs.readFileSync('src/components/History/HistoryView.tsx', 'utf8');

file = file.replace(
  'className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden"',
  'className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden"'
);

file = file.replace(
  'text-slate-300">\n              歷史戰績總覽',
  'text-slate-600 dark:text-slate-300">\n              歷史戰績總覽'
);

file = file.replace(
  'text-slate-100"}\`}>\n              {Math.abs(totalNetAmount).toLocaleString()}',
  'text-slate-800 dark:text-slate-100"}\`}>\n              {Math.abs(totalNetAmount).toLocaleString()}'
);

file = file.replace(
  '<span className="text-[10px] text-slate-400 block">總局數</span>\n            <span className="text-sm font-black font-mono text-white">{totalRoundsAll} 局</span>',
  '<span className="text-[10px] text-slate-500 dark:text-slate-400 block">總局數</span>\n            <span className="text-sm font-black font-mono text-slate-800 dark:text-white">{totalRoundsAll} 局</span>'
);

// bg-slate-800/40 border border-slate-700/40
file = file.replace(
  /bg-slate-800\/40 border border-slate-700\/40/g,
  'bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/40'
);

// border-slate-800/80
file = file.replace(
  /border-slate-800\/80/g,
  'border-slate-200 dark:border-slate-800/80'
);

fs.writeFileSync('src/components/History/HistoryView.tsx', file, 'utf8');