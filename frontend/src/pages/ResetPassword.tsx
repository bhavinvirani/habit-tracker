import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

type PageState = 'validating' | 'form' | 'invalid' | 'success';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const validatedRef = useRef(false);

  const [pageState, setPageState] = useState<PageState>(token ? 'validating' : 'invalid');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!token || validatedRef.current) return;
    validatedRef.current = true;
    api
      .post('/auth/validate-reset-token', { token })
      .then(() => setPageState('form'))
      .catch(() => setPageState('invalid'));
  }, [token]);

  useEffect(() => {
    if (pageState !== 'success') return;
    const timer = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(timer);
  }, [pageState, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: formData.password });
      setPageState('success');
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message: string; code?: string } } } };
      const message = error.response?.data?.error?.message || 'Failed to reset password';
      if (error.response?.data?.error?.code === 'AUTHENTICATION_ERROR') {
        setPageState('invalid');
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageState === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md relative z-10 text-center">
          <Loader2 size={24} className="text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-dark-500">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-dark-100 tracking-tight">Invalid Reset Link</h1>
          </div>
          <div className="bg-dark-900 border border-white/[0.06] rounded-2xl p-6 shadow-card text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-red/[0.12] mb-4">
              <AlertCircle size={24} className="text-accent-red" />
            </div>
            <p className="text-sm text-dark-400 mb-5">
              This password reset link is invalid, expired, or has already been used. Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-primary inline-flex">
              Request New Link
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-dark-100 tracking-tight">
            {pageState === 'success' ? 'Password Reset' : 'Set New Password'}
          </h1>
          <p className="text-sm text-dark-500 mt-1.5">
            {pageState === 'success' ? 'Your password has been updated' : 'Choose a strong new password'}
          </p>
        </div>

        <div className="bg-dark-900 border border-white/[0.06] rounded-2xl p-6 shadow-card">
          {pageState === 'success' ? (
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-green/[0.12] mb-4">
                <CheckCircle size={24} className="text-accent-green" />
              </div>
              <p className="text-sm text-dark-400 mb-1.5">
                Your password has been reset successfully. All previous sessions have been signed out.
              </p>
              <p className="text-xs text-dark-600 mb-5">Redirecting to sign in...</p>
              <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign in now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
                  <input
                    type="password"
                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                {errors.password && <p className="text-accent-red text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
                  <input
                    type="password"
                    className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                {errors.confirmPassword && <p className="text-accent-red text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
