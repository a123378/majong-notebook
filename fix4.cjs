const fs = require('fs');
let file = fs.readFileSync('src/components/Modals/SettingsModal.tsx', 'utf8');

file = file.replace('VolumeX,\n  Wifi,\n  Download,', 'VolumeX,\n  Download,');
file = file.replace('onOpenSync: () => void;\n', '');
file = file.replace('  onOpenSync,\n', '');
file = file.replace('const { config } = useSync();\n', '');

fs.writeFileSync('src/components/Modals/SettingsModal.tsx', file, 'utf8');