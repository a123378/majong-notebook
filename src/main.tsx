import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { PwaProvider } from './context/PwaContext';
import { SyncProvider } from './context/SyncContext';
import { GameProvider } from './context/GameContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <PwaProvider>
        <SyncProvider>
          <GameProvider>
            <App />
          </GameProvider>
        </SyncProvider>
      </PwaProvider>
    </ThemeProvider>
  </React.StrictMode>
);
