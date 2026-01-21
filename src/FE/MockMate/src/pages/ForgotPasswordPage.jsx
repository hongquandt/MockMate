import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Send verification code to:', email);
    // Navigate to OTP verification page with email
    navigate('/verify-otp', { state: { email } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section with Icon */}
          <div className="bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-4">
              <span className="material-symbols-outlined text-4xl text-primary">lock_reset</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 md:px-10 py-8">
            {/* Title */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-black text-[#0d141b] dark:text-white mb-2">
                Forgot Password?
              </h1>
              <p className="text-[#4c719a] dark:text-slate-400 text-sm">
                Enter the email address associated with your account and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
              >
                Send Verification Code
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-6 text-xs text-[#4c719a] dark:text-slate-500">
          Need help?{' '}
          <a href="#" className="text-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
