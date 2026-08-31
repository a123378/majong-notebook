const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Restore to Header
app = app.replace(
  '        onOpenHistory={() => setActiveTab(\'history\')}\n        onOpenInstall={() => setIsInstallOpen(true)}',
  '        onOpenHistory={() => setActiveTab(\'history\')}\n        onOpenSync={() => setIsSyncOpen(true)}\n        onOpenInstall={() => setIsInstallOpen(true)}'
);

fs.writeFileSync('src/App.tsx', app, 'utf8');