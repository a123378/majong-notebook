const fs = require('fs');
const file = 'src/components/History/HistoryView.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldStr = <div className="space-y-3">\n          {historySessions.map((session) => {;

const newStr = <div className="space-y-6">
          {Object.entries(
            historySessions.reduce((acc, session) => {
              const d = new Date(session.startTime);
              const monthKey = \\年\月\;
              if (!acc[monthKey]) acc[monthKey] = [];
              acc[monthKey].push(session);
              return acc;
            }, {} as Record<string, import('../../types/mahjong').GameSession[]>)
          ).map(([month, sessions]) => (
            <div key={month} className="space-y-3">
              <h3 className="text-sm font-black text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1 px-1">
                {month} <span className="text-xs font-normal">({sessions.length} 局)</span>
              </h3>
              {sessions.map((session) => {;

content = content.replace(oldStr, newStr);

// Now we need to add the closing tags for the nested loops
const oldEnd =                   </div>
                );
              })}
            </div>;

const newEnd =                   </div>
                );
              })}
            </div>
          ))}
        </div>;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync(file, content, 'utf8');