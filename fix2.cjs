const fs = require('fs');
let file = fs.readFileSync('src/components/Modals/SettingsModal.tsx', 'utf8');

// Replace the Cloud Room Sync section with empty string
file = file.replace(
  /\{\/\* Cloud Room Sync \*\/\}\s+<div className="flex items-center justify-between p-3[\s\S]*?<\/div>\n\s+<\/div>/,
  ''
);

fs.writeFileSync('src/components/Modals/SettingsModal.tsx', file, 'utf8');