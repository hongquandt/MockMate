import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    lowercase: false,
    number: false,
    special: false
  });

  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength({
        length: value.length >= 8,
        lowercase: /[a-z]/.test(value) && /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@#$%^&*!]/.test(value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Reset password:', formData);
    // Navigate to login page after successful reset
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Left Side - Form */}
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-3">
            <img src={logoImg} alt="MockMate Logo" className="h-10 w-10 object-contain rounded-lg" />
            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">MockMate</h2>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-6 mb-8 text-sm">
            <a href="/" className="text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors">
              Home
            </a>
            <a href="#" className="text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#" className="text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors">
              Resources
            </a>
          </nav>

          {/* Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl px-8 md:px-10 py-10">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#0d141b] dark:text-white mb-3">
                Create New Password
              </h1>
              <p className="text-[#4c719a] dark:text-slate-400 text-sm">
                Your new password must be different from previous passwords.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                    lock
                  </span>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c719a] hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                    lock
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c719a] hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Security Requirements */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#0d141b] dark:text-white mb-3 uppercase tracking-wide">
                  Security Requirements
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.length ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      {passwordStrength.length && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-[#4c719a] dark:text-slate-400'
                    }`}>
                      At least 8 characters long
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.lowercase ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      {passwordStrength.lowercase && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.lowercase ? 'text-green-600 dark:text-green-400' : 'text-[#4c719a] dark:text-slate-400'
                    }`}>
                      Include at least one uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passwordStrength.number ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}>
                      {passwordStrength.number && (
                        <span className="material-symbols-outlined text-white text-xs">check</span>
                      )}
                    </div>
                    <span className={`text-xs ${
                      passwordStrength.number ? 'text-green-600 dark:text-green-400' : 'text-[#4c719a] dark:text-slate-400'
                    }`}>
                      Include at least one number or special character (@, #, $, %, !, etc.)
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
              >
                Update Password
              </button>
            </form>

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
