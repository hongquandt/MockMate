import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImg} alt="MockMate Logo" className="h-10 w-10 object-contain rounded-lg" />
            <h2 className="text-2xl font-bold text-[#0d141b] dark:text-white">MockMate</h2>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#0d141b] dark:text-white mb-3">
              Bắt đầu hành trình cùng MockMate
            </h1>
            <p className="text-[#4c719a] dark:text-slate-400">
              Tạo tài khoản MockMate để luyện tập phỏng vấn thông minh cùng AI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                  person
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                Email công việc
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                  mail
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0d141b] dark:text-white mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4c719a] material-symbols-outlined text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white placeholder:text-[#4c719a]/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4c719a] hover:text-primary"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="mt-2 text-xs text-[#4c719a] dark:text-slate-400">
                Mật khẩu phải có ít nhất 8 ký tự
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Đăng ký ngay
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#cfdbe7] dark:bg-slate-700"></div>
            <span className="text-sm text-[#4c719a] dark:text-slate-400">Hoặc tiếp tục với</span>
            <div className="flex-1 h-px bg-[#cfdbe7] dark:bg-slate-700"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#cfdbe7] dark:border-slate-600 bg-white dark:bg-slate-800 text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
          </div>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-[#4c719a] dark:text-slate-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-800 to-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-sky-400 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/20 p-3 rounded-xl">
                <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
              </div>
              <div>
                <h3 className="text-white text-xl font-bold mb-2">MockMate AI</h3>
                <p className="text-sky-100 text-sm">Excellence in Recruit</p>
              </div>
            </div>
            <div className="aspect-video bg-slate-700/50 rounded-2xl mb-6 flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-6xl mb-4 block">analytics</span>
                <p className="text-white font-semibold">AI-Powered Interview Practice</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                </div>
                <div>
                  <h4 className="text-[#0d141b] font-bold mb-1">Cải thiện 80% kỹ năng</h4>
                  <p className="text-[#4c719a] text-sm">
                    Người dùng MockMate báo cáo sự tự tin tăng vọt sau chỉ 3 phiên luyện tập với AI Coach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
