const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('        onOpenSync={() => setIsSyncOpen(true)}\n        onOpenInstall', '        onOpenInstall');
fs.writeFileSync('src/App.tsx', app, 'utf8');