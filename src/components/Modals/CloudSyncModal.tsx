import React, { useState, useEffect } from 'react';
import { Cloud, Check, LogOut, KeyRound, Mail, X } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { playTileClickSound } from '../../services/sound';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { isOnline } = useSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playTileClickSound();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      import('../../services/syncService').then(({ processOfflineSyncQueue }) => {
        processOfflineSyncQueue();
      });
      
      onClose(); // Close modal on success
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('請先至 Firebase 後台啟用 Email/Password 驗證。');
      } else {
        setError(err.message || '登入失敗，請檢查帳號密碼。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    playTileClickSound();
    await signOut(auth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cloud size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
              雲端同步設定
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {user ? '已連線至雲端' : '登入以啟用跨裝置同步'}
            </p>
          </div>
        </div>

        {!isOnline && (
          <div className="p-3 mb-4 text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
            目前處於離線狀態，登入功能可能無法運作。
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                <Check size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">已登入雲端帳號</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center px-4">
              您的戰績紀錄會自動備份至雲端，並同步到您的其他裝置。
            </p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <LogOut size={18} />
              登出並轉為訪客模式
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="電子郵件"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="relative">
                <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="密碼"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isOnline}
              className="w-full flex items-center justify-center py-3.5 rounded-2xl font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all"
            >
              {loading ? '處理中...' : isLogin ? '登入雲端' : '註冊新帳號'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors"
              >
                {isLogin ? '沒有帳號嗎？點我註冊' : '已經有帳號？點我登入'}
              </button>
            </div>
            
            <div className="text-[11px] text-center text-slate-400 px-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              💡 若不登入，系統將預設為「訪客模式」，所有戰績僅會儲存於目前裝置，不會上傳雲端。
            </div>
          </form>
        )}
      </div>
    </div>
  );
};