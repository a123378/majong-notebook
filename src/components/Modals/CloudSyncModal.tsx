import React, { useState } from 'react';
import { X, Cloud, Mail, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { useSync } from '../../context/SyncContext';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const { isOnline } = useSync();
  const auth = getAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const user = auth.currentUser;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('請前往 Firebase 後台啟用 Email/Password 驗證');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('帳號或密碼錯誤');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('此信箱已經被註冊過了');
      } else {
        setError(err.message || '登入/註冊失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-pop">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center mb-6 mt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Cloud size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
            雲端同步
          </h2>
          <p className="text-xs font-bold text-slate-500">
            {isOnline ? '🟢 已連線至網際網路' : '🔴 離線中 (僅支援本地儲存)'}
          </p>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
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