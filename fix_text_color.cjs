const fs = require('fs');
let file = fs.readFileSync('src/components/History/HistoryView.tsx', 'utf8');

file = file.replace(
  "'text-slate-100'",
  "'text-slate-700 dark:text-slate-300'"
);

file = file.replace(
  "isTotalPositive ? 'text-emerald-400' : isTotalNegative ? 'text-rose-400' : 'text-slate-400'",
  "isTotalPositive ? 'text-emerald-500 dark:text-emerald-400' : isTotalNegative ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400'"
);

file = file.replace(
  "isTotalPositive\n                  ? 'text-emerald-400'\n                  : isTotalNegative\n                  ? 'text-rose-400'\n                  : 'text-slate-700 dark:text-slate-300'",
  "isTotalPositive\n                  ? 'text-emerald-600 dark:text-emerald-400'\n                  : isTotalNegative\n                  ? 'text-rose-600 dark:text-rose-400'\n                  : 'text-slate-700 dark:text-slate-300'"
);

file = file.replace(
  'text-emerald-400">{overallWinRate}%',
  'text-emerald-500 dark:text-emerald-400">{overallWinRate}%'
);
file = file.replace(
  'text-amber-400">{totalTsumoAll} 次',
  'text-amber-500 dark:text-amber-400">{totalTsumoAll} 次'
);
file = file.replace(
  'text-rose-400">{totalDealInAll} 次',
  'text-rose-500 dark:text-rose-400">{totalDealInAll} 次'
);

fs.writeFileSync('src/components/History/HistoryView.tsx', file, 'utf8');