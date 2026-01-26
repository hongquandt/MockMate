import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';
import { authService } from '../services/api';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        setUser(storedUser);
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate('/'); // Optional: Refresh or stay
    };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      {/* Header */}
      <div className="layout-container flex flex-col border-b border-solid border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-background-dark sticky top-0 z-50">
        <div className="px-6 md:px-10 lg:px-40 flex justify-center py-3">
          <header className="flex items-center justify-between whitespace-nowrap w-full max-w-[1200px]">
            <div className="flex items-center gap-3 text-[#0d141b] dark:text-white cursor-pointer" onClick={() => navigate('/')}>
              <img src={logoImg} alt="MockMate Logo" className="h-10 w-10 object-contain rounded-lg" />
              <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">MockMate</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8 items-center">
              <nav className="hidden md:flex items-center gap-9">
                <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#">Features</a>
                <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#">Pricing</a>
                <a className="text-[#0d141b] dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#">About Us</a>
              </nav>
              
              {user ? (
                  // User Avatar & Dropdown
                  <div className="relative">
                      <button 
                          onClick={() => setShowDropdown(!showDropdown)}
                          className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                              {/* Show Avatar or Initials */}
                              {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover"/>
                              ) : (
                                  user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                              )}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate">
                              {user.fullName || 'User'}
                          </span>
                          <span className="material-symbols-outlined text-slate-400 text-lg">arrow_drop_down</span>
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown && (
                          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 animate-in fade-in zoom-in duration-200">
                              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                              </div>
                              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors">
                                  <span className="material-symbols-outlined text-lg">person</span>
                                  My Profile
                              </Link>
                              <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors">
                                  <span className="material-symbols-outlined text-lg">dashboard</span>
                                  Dashboard
                              </Link>
                              <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                              <button 
                                  onClick={handleLogout}
                                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                  <span className="material-symbols-outlined text-lg">logout</span>
                                  Sign Out
                              </button>
                          </div>
                      )}
                  </div>
              ) : (
                  // Guest Login/Register Buttons
                  <div className="flex gap-2">
                    <Link to="/register" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold tracking-[0.015em] hover:bg-primary-dark transition-colors">
                      <span>Sign Up</span>
                    </Link>
                    <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#e7edf3] dark:bg-slate-700 text-[#0d141b] dark:text-white text-sm font-bold tracking-[0.015em] hover:bg-[#d1dbe5] transition-colors">
                      <span>Log In</span>
                    </Link>
                  </div>
              )}
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <div className="px-6 md:px-10 lg:px-40 flex justify-center py-10 lg:py-20">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="@container">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
                <div className="flex flex-col gap-6 lg:w-1/2">
                  <div className="flex flex-col gap-4 text-left">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:bg-primary/20 w-fit">
                      Powered by Advanced AI
                    </span>
                    <h1 className="text-[#0d141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl lg:text-6xl">
                      Master Your Interview with AI
                    </h1>
                    <p className="text-[#4c719a] dark:text-slate-300 text-lg md:text-xl font-normal leading-relaxed max-w-[500px]">
                      MockMate helps you refine your CV, practice real-time interviews, and track your progress to land your dream job.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/register" className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-xl h-14 px-6 bg-primary text-white text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] hover:bg-primary-dark transition-all">
                      <span>Get Started Free</span>
                    </Link>
                    <button className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-xl h-14 px-6 border-2 border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white text-lg font-bold hover:bg-[#e7edf3] dark:hover:bg-slate-700 transition-colors">
                      <span>View Demo</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex -space-x-3">
                      <div className="size-10 rounded-full border-2 border-white dark:border-background-dark bg-slate-200"></div>
                      <div className="size-10 rounded-full border-2 border-white dark:border-background-dark bg-slate-300"></div>
                      <div className="size-10 rounded-full border-2 border-white dark:border-background-dark bg-slate-400"></div>
                    </div>
                    <p className="text-sm text-[#4c719a] dark:text-slate-400 font-medium">Joined by 10k+ candidates this month</p>
                  </div>
                </div>
                <div className="lg:w-1/2">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative border-8 border-white dark:border-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                    <div className="h-full w-full bg-center bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBa_L1jtjkHRNSU4X9y85K8LgdPKy07HLiULR_1s-CjbiIrn4FmxGh-7ZMBc-3vOYIGuNFCT_gTfc6-d3IJGUmyeAikZ5qcvr21GHRCFz3Nymt93VOwh3AMpj7uugzmBwkW4htv5godnFn88RbPu2q-TyaHTuU899DZX6y8UJUYA6EHEndrDeE48J8GrDAnLaWigPtjDtNGV5AshmkTFwNQNI_lDPRfqa0ON4-24LwqciV279OyN4KRNNHaVPW6Z9WFEUDRmo8aU8k")'}}></div>
                    <div className="absolute bottom-6 right-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl flex items-center gap-3">
                      <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold dark:text-white">Interview Score</p>
                        <p className="text-lg font-black text-primary">88%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-6 md:px-10 lg:px-40 flex justify-center py-10 bg-white dark:bg-slate-900/50">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="flex flex-wrap gap-6">
              <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-2xl p-8 border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <p className="text-[#4c719a] dark:text-slate-400 text-base font-medium">Active Users</p>
                <p className="text-[#0d141b] dark:text-white tracking-light text-3xl font-black">10,000+</p>
              </div>
              <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-2xl p-8 border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <p className="text-[#4c719a] dark:text-slate-400 text-base font-medium">Interviews Completed</p>
                <p className="text-[#0d141b] dark:text-white tracking-light text-3xl font-black">50,000+</p>
              </div>
              <div className="flex min-w-[200px] flex-1 flex-col gap-2 rounded-2xl p-8 border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
                <p className="text-[#4c719a] dark:text-slate-400 text-base font-medium">Success Rate</p>
                <p className="text-[#0d141b] dark:text-white tracking-light text-3xl font-black">92%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 md:px-10 lg:px-40 flex justify-center py-20">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="flex flex-col gap-12 @container">
              <div className="flex flex-col gap-4 text-center items-center">
                <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Capabilities</h2>
                <h1 className="text-[#0d141b] dark:text-white tracking-light text-4xl font-black leading-tight md:text-5xl max-w-[800px]">
                  Everything you need to succeed
                </h1>
                <p className="text-[#4c719a] dark:text-slate-400 text-lg font-normal leading-normal max-w-[720px]">
                  Our AI-driven platform provides end-to-end support for your job search journey.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-6 rounded-3xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="size-14 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-3xl">description</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h2 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">AI CV Evaluation</h2>
                    <p className="text-[#4c719a] dark:text-slate-400 text-base font-normal leading-relaxed">
                      Get instant feedback on your resume tailored to specific job descriptions and industry standards.
                    </p>
                  </div>
                  <a className="mt-auto text-primary font-bold flex items-center gap-1 text-sm hover:gap-2 transition-all" href="#">
                    Analyze my CV <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
                <div className="flex flex-col gap-6 rounded-3xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="size-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined text-3xl">videocam</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h2 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">Mock Interview</h2>
                    <p className="text-[#4c719a] dark:text-slate-400 text-base font-normal leading-relaxed">
                      Practice with an adaptive AI that asks industry-specific questions and provides real-time coaching.
                    </p>
                  </div>
                  <a className="mt-auto text-primary font-bold flex items-center gap-1 text-sm hover:gap-2 transition-all" href="#">
                    Start practicing <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
                <div className="flex flex-col gap-6 rounded-3xl border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="size-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h2 className="text-[#0d141b] dark:text-white text-xl font-bold leading-tight">Progress Tracking</h2>
                    <p className="text-[#4c719a] dark:text-slate-400 text-base font-normal leading-relaxed">
                      Watch your confidence and score grow with detailed performance analytics and skill heatmaps.
                    </p>
                  </div>
                  <a className="mt-auto text-primary font-bold flex items-center gap-1 text-sm hover:gap-2 transition-all" href="#">
                    View my dashboard <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 md:px-10 lg:px-40 flex justify-center py-20">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-primary px-8 py-16 text-center text-white md:px-16 lg:py-24">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-600/50 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-8">
                <h2 className="text-3xl font-black md:text-5xl max-w-[700px]">Ready to land your dream job?</h2>
                <p className="text-sky-50 text-lg md:text-xl max-w-[600px]">
                  Join thousands of successful candidates who used MockMate to ace their interviews.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white text-primary text-lg font-black shadow-lg hover:scale-105 transition-transform">
                    Get Started Free
                  </Link>
                  <button className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 border-2 border-white/30 bg-white/10 text-white text-lg font-bold hover:bg-white/20 transition-colors">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-[#e7edf3] dark:border-slate-800 py-12">
        <div className="px-6 md:px-10 lg:px-40 flex justify-center">
          <div className="layout-content-container flex flex-col max-w-[1200px] flex-1">
            <div className="flex flex-col md:flex-row justify-between gap-12">
              <div className="flex flex-col gap-6 max-w-xs">
                <div className="flex items-center gap-3 text-[#0d141b] dark:text-white">
                  <img src={logoImg} alt="MockMate Logo" className="h-8 w-8 object-contain rounded-lg" />
                  <h2 className="text-lg font-bold">MockMate</h2>
                </div>
                <p className="text-[#4c719a] dark:text-slate-400 text-sm leading-relaxed">
                  Empowering candidates worldwide with AI-driven interview preparation tools.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-[#0d141b] dark:text-white">Product</h4>
                  <nav className="flex flex-col gap-2">
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">AI Coach</a>
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">CV Scanner</a>
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">Pricing</a>
                  </nav>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-[#0d141b] dark:text-white">Company</h4>
                  <nav className="flex flex-col gap-2">
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">About Us</a>
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">Blog</a>
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">Careers</a>
                  </nav>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="font-bold text-[#0d141b] dark:text-white">Legal</h4>
                  <nav className="flex flex-col gap-2">
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">Privacy</a>
                    <a className="text-sm text-[#4c719a] dark:text-slate-400 hover:text-primary transition-colors" href="#">Terms</a>
                  </nav>
                </div>
              </div>
            </div>
            <div className="border-t border-[#e7edf3] dark:border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#4c719a] dark:text-slate-400">© 2024 MockMate AI. All rights reserved.</p>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-xl text-[#4c719a] cursor-pointer hover:text-primary transition-colors">public</span>
                <span className="material-symbols-outlined text-xl text-[#4c719a] cursor-pointer hover:text-primary transition-colors">share</span>
                <span className="material-symbols-outlined text-xl text-[#4c719a] cursor-pointer hover:text-primary transition-colors">mail</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
