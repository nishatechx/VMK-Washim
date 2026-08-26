import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { authenticate } from '../services/authService';
import { UserProfile } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = authenticate(username, password);

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('Invalid User ID or Password. Please check credentials.');
        setIsLoading(false);
      }
    }, 250);
  };

  const bgImageUrl =
    'https://blogger.googleusercontent.com/img/a/AVvXsEjmAY-7sCfDo5E5JYJ0XRhxw4b9ryC30M_A6kcbxNrI08JnWQeeXNLJSYmtxklJsFjv5LMr1Mnn06QcGHr0pJ6lHjwKNsIcyRLQ_DUuJgUZgd3hRbcJXjlRABvdnoPaMiRCTPahNvGIwuUfrKnDE78yChj2XQ2RJSyGLSUaJWwsByN7A5UCfk1MOFeaAIY=s1600';

  return (
    <div
      id="login-screen-root"
      className="relative flex items-center justify-center lg:justify-end min-h-screen w-full bg-slate-100 text-slate-900 font-sans select-none overflow-hidden px-4 sm:px-8 md:px-12 lg:px-20 py-8"
    >
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <img
          src={bgImageUrl}
          alt="Portal Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle overlay for clean contrast */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-95" />
      </div>

      {/* Main Login Card - Right-Aligned Minimal Form without card background */}
      <main className="relative z-10 w-full max-w-[280px] sm:max-w-[300px]">
        <div
          id="login-card"
          className="w-full flex flex-col items-center gap-4 transition-all"
        >
          {errorMsg && (
            <div className="w-full flex items-center gap-2 p-2.5 bg-red-950/80 backdrop-blur-md border border-red-500/50 rounded-xl text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-3.5">
            <div>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-sky-300 absolute left-3.5 pointer-events-none" />
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="User ID"
                  required
                  autoComplete="username"
                  autoFocus
                  className="w-full pl-10 pr-3 py-2.5 bg-black/30 hover:bg-black/40 focus:bg-black/50 backdrop-blur-md border border-white/25 focus:border-sky-400 rounded-xl text-white placeholder-sky-200/60 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30 font-mono transition-all shadow-lg shadow-black/20"
                />
              </div>
            </div>

            <div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-sky-300 absolute left-3.5 pointer-events-none" />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/30 hover:bg-black/40 focus:bg-black/50 backdrop-blur-md border border-white/25 focus:border-sky-400 rounded-xl text-white placeholder-sky-200/60 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 font-mono transition-all shadow-lg shadow-black/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-sky-300 hover:text-white p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-sky-950/60 mt-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
