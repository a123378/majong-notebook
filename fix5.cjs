const fs = require('fs');
let file = fs.readFileSync('src/components/Modals/SettingsModal.tsx', 'utf8');
file = file.replace("import { useSync } from '../../context/SyncContext';\n", '');
fs.writeFileSync('src/components/Modals/SettingsModal.tsx', file, 'utf8');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace('onOpenSync={() => setSyncModalOpen(true)}\n', '');
fs.writeFileSync('src/App.tsx', app, 'utf8');