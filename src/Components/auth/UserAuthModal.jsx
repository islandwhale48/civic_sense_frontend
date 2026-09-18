import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { issueService } from '../../services/issueService';

export function UserAuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email address and password.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let res;
      if (mode === 'register') {
        res = await issueService.registerCitizen(name.trim(), email.trim(), password.trim());
      } else {
        res = await issueService.loginCitizen(email.trim(), password.trim());
      }

      const userData = res.data?.user || res.user;
      const token = res.data?.token || res.token;

      if (userData) {
        resetForm();
        onSuccess(userData, token);
      } else {
        setError('Authentication failed. Please check your inputs.');
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('prakash@civicsense.gov.in');
    setPassword('password123');
    setLoading(true);
    setError('');

    try {
      const res = await issueService.loginCitizen('prakash@civicsense.gov.in', 'password123');
      const userData = res.data?.user || res.user;
      const token = res.data?.token || res.token;

      if (userData) {
        resetForm();
        onSuccess(userData, token);
      } else {
        setError('Demo login failed.');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
      subtitle="Sign in to report issues, upvote, and track civic resolutions"
      icon="👤"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-800/90 p-1 border border-slate-700/80">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔑 Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prakash Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. prakash@civicsense.gov.in"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Password <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-2 flex flex-col gap-2">
            <Button type="submit" variant="primary" isLoading={loading} className="w-full py-2.5">
              {mode === 'login' ? '🔑 Log In & Proceed' : '✨ Create Account & Proceed'}
            </Button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-400 transition-colors"
            >
              🚀 Quick 1-Click Demo Login (Prakash Kumar)
            </button>
          </div>
        </form>

        <p className="text-[11px] text-slate-500 text-center mt-1">
          🔒 Secure Citizen Account • CommunityKiHelp CivicSense Platform
        </p>

      </div>
    </Modal>
  );
}

export default UserAuthModal;
