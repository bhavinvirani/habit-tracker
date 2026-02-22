import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message: string } } } };
      toast.error(error.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-600 mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-dark-100 tracking-tight">
            {isSuccess ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-dark-500 mt-1.5">
            {isSuccess
              ? 'We sent you a password reset link'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-900 border border-white/[0.06] rounded-2xl p-6 shadow-card">
          {isSuccess ? (
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-green/[0.12] mb-4">
                <CheckCircle size={24} className="text-accent-green" />
              </div>
              <p className="text-sm text-dark-400 mb-5">
                If an account exists for <span className="text-dark-200 font-medium">{email}</span>,
                {" you'll receive a password reset link shortly. The link expires in 15 minutes."}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
                    <input
                      type="email"
                      className={`input pl-10 ${error ? 'input-error' : ''}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-accent-red text-xs mt-1">{error}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-dark-500">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
