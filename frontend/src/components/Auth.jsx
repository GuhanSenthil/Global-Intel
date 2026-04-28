import { useState } from 'react';
import { login, signup } from '../api';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await login(username, password);
        onLogin(res.data.access_token);
      } else {
        const res = await signup(username, password);
        onLogin(res.data.access_token);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#040816] px-4 py-6">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(2,6,23,0.55), rgba(2,6,23,0.82)), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), url(/Logoin%20Page.png)',
          backgroundSize: '100% 100%, 48px 48px, 48px 48px, cover',
          backgroundPosition: 'center, center, center, center',
          backgroundRepeat: 'no-repeat, repeat, repeat, no-repeat',
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute right-10 top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-8 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 1440 900" fill="none" aria-hidden="true">
          <path d="M120 180 C 280 120, 360 260, 520 200 S 820 160, 980 240 S 1260 320, 1340 180" stroke="rgba(59,130,246,0.38)" strokeWidth="1.2" strokeDasharray="5 14" />
          <path d="M240 640 C 380 520, 520 760, 700 620 S 1020 520, 1180 700" stroke="rgba(34,197,94,0.22)" strokeWidth="1.2" strokeDasharray="4 13" />
          <path d="M180 320 C 360 410, 520 280, 720 360 S 1040 470, 1280 320" stroke="rgba(56,189,248,0.28)" strokeWidth="1.2" strokeDasharray="3 12" />
          <circle cx="520" cy="200" r="4" fill="rgba(96,165,250,0.95)" />
          <circle cx="980" cy="240" r="4" fill="rgba(34,197,94,0.9)" />
          <circle cx="700" cy="620" r="4" fill="rgba(56,189,248,0.9)" />
          <circle cx="1280" cy="320" r="4" fill="rgba(147,197,253,0.9)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[92vw] rounded-3xl border border-cyan-400/20 bg-slate-950/70 p-5 shadow-[0_0_50px_rgba(59,130,246,0.25)] backdrop-blur-xl sm:max-w-md sm:p-8">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 h-24 w-24 rounded-full border border-cyan-400/40 bg-white bg-center bg-contain bg-no-repeat p-3 shadow-[0_0_30px_rgba(34,211,238,0.4)] sm:h-28 sm:w-28"
            style={{ backgroundImage: 'url(/Global%20Intel.png)' }}
            aria-label="Logo"
            role="img"
          />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Global Intel Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Secure access to the intelligence interface
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Username</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-sm text-cyan-300 transition hover:text-cyan-200"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
