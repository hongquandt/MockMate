import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

import { authService } from '../services/api';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      await authService.verifyOtp(email, otpCode);
      // Navigate to reset password page if verify success
      navigate('/reset-password', { state: { email, otp: otpCode } });
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    console.log('Resend code to:', email);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="MockMate Logo" className="h-10 w-10 object-contain rounded-lg" />
            <h2 className="text-xl font-bold text-[#0d141b] dark:text-white">MockMate</h2>
          </div>
          <a href="#" className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary">
            Trợ giúp
          </a>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl px-8 md:px-10 py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-primary">mark_email_read</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-black text-[#0d141b] dark:text-white mb-3">
              Xác thực tài khoản
            </h1>
            <p className="text-[#4c719a] dark:text-slate-400 text-sm leading-relaxed">
              Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và nhập mã số dưới đây).
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
                {error}
            </div>
          )}

          {/* OTP Input */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
                    digit
                      ? 'border-primary bg-sky-50 dark:bg-sky-900/20 text-primary'
                      : 'border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-700 text-[#0d141b] dark:text-white'
                  } focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận'}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#4c719a] dark:text-slate-400">
              Bạn chưa nhận được mã?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="text-primary font-semibold hover:underline"
              >
                Gửi lại mã
              </button>
            </p>
            <p className="text-xs text-[#4c719a] dark:text-slate-500 mt-2 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Yêu cầu gửi lại sau 3'
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="inline-flex items-center gap-1 text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary font-medium"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Quay lại trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
