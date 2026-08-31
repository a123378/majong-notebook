const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Restore to Header
app = app.replace(
  '<Header\n          activeTab={activeTab}\n          setActiveTab={setActiveTab}\n          onOpenSettings={() => setIsSettingsOpen(true)}\n          onOpenHistory={() => setActiveTab(\'history\')}\n          onOpenInstall={() => setIsInstallOpen(true)}',
  '<Header\n          activeTab={activeTab}\n          setActiveTab={setActiveTab}\n          onOpenSettings={() => setIsSettingsOpen(true)}\n          onOpenHistory={() => setActiveTab(\'history\')}\n          onOpenSync={() => setIsSyncOpen(true)}\n          onOpenInstall={() => setIsInstallOpen(true)}'
);

// Remove from SettingsModal
app = app.replace(
  '<SettingsModal\n        isOpen={isSettingsOpen}\n        onClose={() => setIsSettingsOpen(false)}\n        onOpenEndGame={() => setIsEndGameOpen(true)}\n        onOpenSync={() => setIsSyncOpen(true)}\n        onOpenInstall',
  '<SettingsModal\n        isOpen={isSettingsOpen}\n        onClose={() => setIsSettingsOpen(false)}\n        onOpenEndGame={() => setIsEndGameOpen(true)}\n        onOpenInstall'
);

fs.writeFileSync('src/App.tsx', app, 'utf8');