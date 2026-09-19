import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Sparkles, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { VanishInput } from './VanishInput';
import { SmoothInput } from './SmoothInput';
import { supabase, signInWithGoogle } from '../services/supabaseClient';

interface LoginScreenProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          throw error;
        }

        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onBack();
        }, 800);
      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              name: name.trim() || email.split('@')[0],
              avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            },
          },
        });

        if (error) {
          throw error;
        }

        setSuccessMsg('Account created successfully! Welcome to EVA Music.');
        setTimeout(() => {
          onLoginSuccess(data.user || { email, user_metadata: { name } });
          onBack();
        }, 900);
      }
    } catch (err: any) {
      console.warn('[LoginScreen] Auth error:', err);
      // Friendly error handling
      const message = err?.message || 'Authentication error. Please check your credentials.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.warn('[LoginScreen] Google Auth notice:', err);
      setErrorMsg(err?.message || 'Google sign in encountered an issue. You can also sign in with email.');
      setIsLoading(false);
    }
  };

  // Instant 1-click Demo Login for fast testing
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg('Signing in with Demo Account...');

    try {
      const demoEmail = 'demo.listener@evamusic.app';
      const demoPass = 'EvaMusic2025!';

      // Try actual Supabase login or demo fallback
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (error) {
        // Fallback mock user if remote auth is unavailable
        const mockUser = {
          id: 'demo-user-eva',
          email: demoEmail,
          user_metadata: {
            name: 'Alex Rivera',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          },
        };
        setTimeout(() => {
          onLoginSuccess(mockUser);
          onBack();
        }, 700);
        return;
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
        onBack();
      }, 700);
    } catch {
      const mockUser = {
        id: 'demo-user-eva',
        email: 'samantha@evamusic.app',
        user_metadata: {
          name: 'Samantha Vibe',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
      };
      onLoginSuccess(mockUser);
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#fcf8ff] text-slate-900 pb-36 px-6 max-w-md mx-auto flex flex-col justify-between select-none">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-10%] w-[380px] h-[380px] rounded-full bg-gradient-to-br from-purple-300/40 via-fuchsia-200/30 to-transparent blur-3xl" />
        <div className="absolute top-[35%] right-[-15%] w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-pink-200/40 via-purple-200/30 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Top Header with Back Navigation */}
        <div className="flex items-center justify-between pt-6 pb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 font-bold text-xs shadow-xs border border-white/90 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            aria-label="Back to settings"
          >
            <ChevronLeft size={16} />
            <span>Back to Settings</span>
          </button>

          <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck size={13} />
            Supabase Cloud
          </span>
        </div>

        {/* Hero Branding */}
        <div className="text-center mt-6 space-y-2">
          <div className="inline-flex relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-600 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-16 h-16 rounded-2xl bg-white p-2.5 border-2 border-white shadow-md flex items-center justify-center mx-auto">
              <img
                src="/eva-logo.svg"
                alt="EVA Music"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pt-2">
            {mode === 'signin' ? 'Welcome to EVA Music' : 'Join EVA Music'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Sync your liked songs, playlists & audio preferences across all your devices
          </p>
        </div>

        {/* Google OAuth One-Click Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 border border-slate-200/90 shadow-xs active:scale-98 transition-all cursor-pointer group"
          >
            <svg className="w-5 h-5 flex-none transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Or Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80" />
            </div>
            <span className="relative px-3 bg-[#fcf8ff] text-[11px] font-bold uppercase tracking-wider text-slate-400">
              or sign in with email
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs (Sign In / Create Account) */}
        <div className="p-1 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-2xs flex items-center">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm scale-101'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm scale-101'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50/90 border border-red-200/80 text-red-700 text-xs flex items-start gap-2 animate-fade-in shadow-2xs">
            <AlertCircle size={16} className="text-red-500 flex-none mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 size={16} className="text-emerald-600 flex-none" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="mt-5 space-y-3.5">
          {/* Full Name field if Sign Up */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70 mb-1.5 ml-1">
                Your Name
              </label>
              <SmoothInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samantha Vibe"
                required={mode === 'signup'}
                icon={<User size={16} />}
              />
            </div>
          )}

          {/* Vanishing Email Form Input */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70 mb-1.5 ml-1">
              Email Address
            </label>
            <VanishInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yo@gxuri.me"
              placeholders={[
                'yo@gxuri.me',
                'samantha@evamusic.app',
                'your.email@gmail.com',
                'synthwave@beats.io',
                'musiclover@cosmic.fm'
              ]}
              icon={<Mail size={16} />}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          {/* Password field with Smooth Spring Caret */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70 mb-1.5 ml-1">
              Password
            </label>
            <SmoothInput
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              icon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn size={18} />
                <span>Sign In to EVA Music</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Free Account</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80" />
          </div>
          <span className="relative px-3 bg-[#fcf8ff] text-[11px] font-bold uppercase tracking-wider text-slate-400">
            or quick test
          </span>
        </div>

        {/* Quick Demo Login Button */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white/80 hover:bg-white text-purple-950 font-bold text-xs flex items-center justify-center gap-2 border border-purple-200/70 shadow-sm active:scale-98 transition-all cursor-pointer group"
        >
          <Zap size={16} className="text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
          <span>⚡ Quick 1-Click Demo Login</span>
        </button>
      </div>

      {/* Footer link */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors cursor-pointer"
        >
          Continue exploring as Guest
        </button>
      </div>
    </div>
  );
};
