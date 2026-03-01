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
    <div className="font-display bg-background-light text-secondary selection:bg-primary/20 antialiased mesh-gradient-modern min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <header className="w-full max-w-7xl glass-card-modern rounded-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div>
              <img src={logoImg} alt="MockMate Logo" className="w-10 h-10 object-cover rounded-lg" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-secondary">
              Mock<span className="text-primary">Mate</span>
            </h2>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a className="text-sm font-semibold text-secondary-light hover:text-secondary transition-colors" href="#features">Features</a>
            <a className="text-sm font-semibold text-secondary-light hover:text-secondary transition-colors" href="#about">About</a>
            <a className="text-sm font-semibold text-secondary-light hover:text-secondary transition-colors" href="#faq">FAQ</a>
            <a className="text-sm font-semibold text-secondary-light hover:text-secondary transition-colors" href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[100px] truncate">
                    {user.fullName || 'User'}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-lg">arrow_drop_down</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">person</span>
                      My Profile
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Dashboard
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-bold text-secondary hover:text-primary transition-colors">Log In</Link>
                <Link to="/register" className="btn-cta px-6 py-2.5 flex items-center justify-center rounded-full text-sm font-bold tracking-wide">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      <main className="relative pt-44 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-light rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4 -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-blue rounded-full blur-3xl opacity-40 translate-y-1/4 -translate-x-1/4 -z-10 mix-blend-multiply"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8 max-w-xl relative z-10">
              <h1 className="text-6xl lg:text-7xl font-extrabold text-secondary leading-[1.1] tracking-tight">
                Master Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Interview</span> with MockMate
              </h1>
              <p className="text-lg text-secondary-light font-medium leading-relaxed max-w-lg">
                Elevate your career with premium AI-powered mock interviews. Real-time feedback, sophisticated analysis, designed for the ambitious professional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/register" className="btn-cta px-10 flex items-center justify-center py-4 rounded-full text-base font-bold tracking-wide shadow-glow-orange">
                  Start Free Trial
                </Link>
                <button className="group bg-white text-secondary border border-slate-200 px-8 py-4 rounded-full text-base font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">play_circle</span>
                  View Demo
                </button>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-slate-100 mt-2">
                <div className="flex -space-x-4">
                  <img alt="User 1" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover ring-2 ring-slate-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARMRPjC2UyqAJs7drsPzgfLll4JUcZt9gTE9Ezyo2qod1Aoiur_dgr4fmoVSG2SzSISy0DbsxRw1sdbP_3Ybka6rb6_9CPFsuh4eX9h5q0M8rvpLR0NOQ4GNvufBuDF_1O3iJG7q12-5J_GMzKv6Agw-KgypXkE2TlB7bGFGd75Y3RGsHDjR8voEalnMbEyCXR5-CMOT4bIsoJlkBjxd69iGynVmT2yX-EcnTiOZ1JaVEw3zu1x27xaCjIsTvVeobTMH7XEz_p5Xoo" />
                  <img alt="User 2" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover ring-2 ring-slate-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKlXMfvg6_pT-es85PdBhqB1nn4I1kg6tVoYOg_f0SAOCQqGWQqrnHM0fhCDA6pWBzfJXWN4XkGrpLeyYUmjBbRSOn4qhgXXYOj45pQWVylnTAUy3pHzF_9jLC2Pm3verGz46z5rEjD0ktdmfyi5x0xsvYC9CRdt2neAnIPPV40aXUTEUN-C9WFe8y7CvlTNRDIruPrjBHK8oypUgKyjY-oKPikt0xLSaw7FDdp_jBO7yO9lITXI90-20XCJOBq92Zzjhlf8ahttBT" />
                  <img alt="User 3" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover ring-2 ring-slate-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0QLcLDHUU8B1z6l016pEebrHfWtlXxefiwjoJWYYA0HZoJMA1JnexznrgwaotC23iZFvg9TX3_Fol6xqDQ-IQ5h6o5BDgKzC9b2sJjfEIx-UUMNMeIozN9Bpk8TOnLiU6RafIGIWla5yeBvUu_hDXXwDL1tEnlLhHmU0P-qf6DfW03d6FrUnVXwQO5yRc54mYoMCdF4RUPpw0t-Ut_KCKWw7wy5BYW88Z1UsTMTlBYbgEz2G7XStL_JyYRg-NZEEMSHrJMxbgGFcO" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">10k+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Professionals Joined</p>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-700">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-blue-500/10 rounded-[2.5rem] blur-2xl"></div>
                <div className="bg-white rounded-[2rem] p-6 relative border border-slate-100 shadow-2xl">
                  <div className="bg-slate-50 rounded-2xl overflow-hidden shadow-inner aspect-[4/5] relative border border-slate-100">
                    <img alt="Pattern" className="absolute inset-0 w-full h-full object-cover opacity-[0.03]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3CAuFMZBwLahJ5ur2pdg9ZaZg6s3bgUWm7DJLkgGKM2OJAr-NynXP9iWy4MWx6goGCu4qfkr9ANXaXXynsXVbs2uLfWxhm0ZbrowIKl_xto4nXOo83lp_CUGwfq2KCUIsWrcYRZHp3qijmklkp3O-bOqv367Y1xzt682_vdSHis85Zcv5ITwM8XJpA9ZqdDXPrrXIkQCCvSwkSgoJyyJeNAG2kW52z1Eo1ypvzI0F0BmzYuZI9iyXW9dL4qINZ4cgITTLzHH6BzJT" />
                    <div className="absolute inset-0 flex flex-col p-8 z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-primary">psychology</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-20 bg-slate-200 rounded-full"></div>
                            <div className="h-1 w-12 bg-slate-100 rounded-full"></div>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          REC
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="w-44 h-44 rounded-full border-4 border-white shadow-xl flex items-center justify-center relative bg-gradient-to-b from-blue-50 to-white">
                          <span className="material-symbols-outlined text-slate-300 text-7xl">face_6</span>
                          <div className="absolute bottom-2 right-2 bg-primary text-white p-2.5 rounded-full shadow-lg shadow-primary/30 border-2 border-white">
                            <span className="material-symbols-outlined text-base">mic</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="h-14 rounded-xl bg-white border border-slate-100 p-2.5 flex items-center gap-2.5 shadow-sm">
                          <div className="w-9 h-9 rounded-lg bg-orange-50 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">bar_chart</span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                            <div className="h-1 w-2/3 bg-slate-100 rounded-full"></div>
                          </div>
                        </div>
                        <div className="h-14 rounded-xl bg-white border border-slate-100 p-2.5 flex items-center gap-2.5 shadow-sm">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">lightbulb</span>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                            <div className="h-1 w-1/2 bg-slate-100 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 -left-8 bg-white p-5 rounded-2xl w-60 border border-slate-100 shadow-xl animate-[bounce_5s_infinite]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded bg-green-50">
                      <span className="material-symbols-outlined text-green-600 text-sm">verified</span>
                    </div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-wide">Communication Score</span>
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-3xl font-extrabold text-secondary">92</span>
                    <span className="text-xl font-bold text-primary mb-1">%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[92%] rounded-full"></div>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 mt-3 pl-2 border-l-2 border-primary">"Excellent pacing and clarity."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="py-24 relative overflow-hidden bg-background-subtle">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Interface</span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary tracking-tight mt-4">Seamless Experience</h2>
        </div>

        <div className="flex gap-8 overflow-x-auto hide-scrollbar px-6 pb-12 snap-x">
          <div className="min-w-[320px] md:min-w-[700px] snap-center group">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-white h-[450px] flex flex-col">
              <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  Live Session
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg pointer-events-auto">
                  <span className="material-symbols-outlined text-secondary text-lg">settings</span>
                </div>
              </div>
              <div className="flex-1 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img alt="Professional Interviewer" className="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD131e5Bodx32-XbnLa2hefwuK5JboYx8_bhPPCy6jk-3E2cVwOR1qbHW3Vn70T4qM70m_LaE3kwwKdrpDY815wS3-aBybEPXUSu1D-UezIvbYEjt-_0mi2HH-f-56dFZd3mFy6sx-Y4U7e7vIjaCbcCOrGk3k59EObbmWXHYbmG38erQg-x21UVpKWdQGyl6VMiNGeXjz45lK2cu17TChaNwy56S-egbZhUODzcDrQz1bUZdD8I0codHjkuUCg2r-isYNVbYMCED2m" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                </div>
                <div className="absolute bottom-20 right-4 z-20 w-24 h-32 md:w-32 md:h-40 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-800">
                  <img alt="User Webcam Feed" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0QLcLDHUU8B1z6l016pEebrHfWtlXxefiwjoJWYYA0HZoJMA1JnexznrgwaotC23iZFvg9TX3_Fol6xqDQ-IQ5h6o5BDgKzC9b2sJjfEIx-UUMNMeIozN9Bpk8TOnLiU6RafIGIWla5yeBvUu_hDXXwDL1tEnlLhHmU0P-qf6DfW03d6FrUnVXwQO5yRc54mYoMCdF4RUPpw0t-Ut_KCKWw7wy5BYW88Z1UsTMTlBYbgEz2G7XStL_JyYRg-NZEEMSHrJMxbgGFcO" />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 border border-white"></div>
                </div>
                <div className="absolute bottom-20 left-0 right-0 h-24 flex items-center justify-center gap-1">
                  <div className="w-1 h-8 bg-primary rounded-full animate-[pulse_1s_infinite]"></div>
                  <div className="w-1 h-12 bg-primary rounded-full animate-[pulse_1.2s_infinite]"></div>
                  <div className="w-1 h-6 bg-primary rounded-full animate-[pulse_0.8s_infinite]"></div>
                  <div className="w-1 h-10 bg-primary rounded-full animate-[pulse_1.5s_infinite]"></div>
                  <div className="w-1 h-14 bg-primary rounded-full animate-[pulse_1.1s_infinite]"></div>
                  <div className="w-1 h-8 bg-primary rounded-full animate-[pulse_0.9s_infinite]"></div>
                </div>
              </div>
              <div className="h-24 bg-white border-t border-slate-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-500">smart_toy</span>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm text-secondary border border-slate-100 relative">
                  <span className="text-primary font-bold mr-1">AI:</span> "Tell me about a time you handled a difficult conflict."
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                </div>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined">mic</span>
                </button>
              </div>
            </div>
          </div>

          <div className="min-w-[320px] md:min-w-[700px] snap-center group">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-slate-50 h-[450px] flex p-6 md:p-8">
              <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-secondary">Session Analytics</h3>
                    <p className="text-xs text-slate-500 font-medium">Report generated: Just now</p>
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Passed
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center justify-center relative">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="transform -rotate-90 w-full h-full">
                        <circle cx="80" cy="80" fill="transparent" r="70" stroke="#F1F5F9" strokeWidth="12"></circle>
                        <circle cx="80" cy="80" fill="transparent" r="70" stroke="#FF6B00" strokeDasharray="440" strokeDashoffset="35" strokeLinecap="round" strokeWidth="12"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-secondary">92<span className="text-lg text-slate-400">%</span></span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span>Confidence</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>Clarity</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 justify-center">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-blue-500 text-sm">speed</span>
                        <span className="text-sm font-bold text-secondary">Pacing Analysis</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-blue-500 h-full w-[85%] rounded-full"></div>
                      </div>
                      <p className="text-[10px] text-slate-500">Your speaking rate is optimal (145 wpm).</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-orange-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                        <span className="text-sm font-bold text-secondary">Vocabulary</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">Strategic</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">Synergy</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600">Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-[320px] md:min-w-[700px] snap-center group">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 h-[450px] flex items-center justify-center p-8">
              <div className="relative w-full max-w-lg">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-40 p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg z-10 transform group-hover:-translate-x-2 transition-transform duration-500">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary">upload_file</span>
                  </div>
                  <h4 className="font-bold text-secondary text-sm">Upload CV</h4>
                  <div className="mt-2 h-1 w-12 bg-slate-200 rounded-full"></div>
                </div>
                <div className="absolute left-[30%] top-1/2 -translate-y-1/2 w-20 h-[2px] bg-gradient-to-r from-slate-200 to-primary/50 z-0"></div>
                <div className="relative mx-auto w-48 p-6 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 scale-110">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-orange flex items-center justify-center mb-4 shadow-md">
                    <span className="material-symbols-outlined text-white text-2xl animate-spin-slow">neurology</span>
                  </div>
                  <h4 className="font-bold text-secondary text-base">AI Analysis</h4>
                  <p className="text-[10px] text-slate-500 mt-2 leading-tight">Processing skills &amp; matching job description...</p>
                </div>
                <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-20 h-[2px] bg-gradient-to-r from-primary/50 to-slate-200 z-0"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-40 p-4 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg z-10 transform group-hover:translate-x-2 transition-transform duration-500">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-blue-600">video_call</span>
                  </div>
                  <h4 className="font-bold text-secondary text-sm">Mock Interview</h4>
                  <div className="mt-2 h-1 w-12 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <div className="w-12 h-1.5 bg-primary rounded-full"></div>
          <div className="w-6 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors cursor-pointer"></div>
          <div className="w-6 h-1.5 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors cursor-pointer"></div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32" id="about">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-square rounded-[2.5rem] flex items-center justify-center p-10 overflow-hidden border border-slate-100 bg-white shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-orange-50/60"></div>
              <span className="material-symbols-outlined text-[18rem] text-white/80 absolute -bottom-16 -right-16 rotate-12">rocket_launch</span>
              <div className="relative z-10 text-center">
                <div className="text-8xl font-black text-secondary mb-2 tracking-tighter">95<span className="text-primary text-6xl">%</span></div>
                <p className="text-secondary-light font-bold uppercase tracking-[0.3em] text-xs border-t-2 border-slate-100 pt-6 mt-2">Candidate Success Rate</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl max-w-[220px] border border-slate-100 shadow-lg">
              <p className="text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">Global Trust</p>
              <div className="flex gap-1 text-primary mb-2">
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
                <span className="material-symbols-outlined text-lg fill-current">star</span>
              </div>
              <p className="text-xs text-secondary-light font-bold">Rated 5/5 by top professionals.</p>
            </div>
          </div>

          <div className="flex flex-col gap-8 order-1 lg:order-2">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Our Mission</span>
              <h2 className="text-5xl font-extrabold text-secondary tracking-tight mt-4 leading-tight">Empowering Ambition with Intelligence.</h2>
            </div>
            <p className="text-lg text-secondary-light font-medium leading-relaxed">
              MockMate bridges the gap between potential and performance. By leveraging cutting-edge AI, we democratize access to elite-level interview coaching, previously reserved for executive candidates.
            </p>
            <div className="grid grid-cols-2 gap-8 mt-4">
              <div className="flex flex-col gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 transition-colors group-hover:bg-primary group-hover:border-primary">
                  <span className="material-symbols-outlined text-2xl text-primary group-hover:text-white transition-colors">insights</span>
                </div>
                <h4 className="font-bold text-secondary text-lg">Visionary Tech</h4>
                <p className="text-sm text-secondary-light font-medium leading-relaxed">Proprietary generative models simulating Fortune 500 interview scenarios.</p>
              </div>
              <div className="flex flex-col gap-3 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 transition-colors group-hover:bg-secondary group-hover:border-secondary">
                  <span className="material-symbols-outlined text-2xl text-blue-600 group-hover:text-white transition-colors">favorite</span>
                </div>
                <h4 className="font-bold text-secondary text-lg">Human Centric</h4>
                <p className="text-sm text-secondary-light font-medium leading-relaxed">Engineered with deep empathy for the candidate's psychological journey.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative overflow-hidden bg-background-subtle" id="features">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-3xl translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -translate-x-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center mb-20 gap-4">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Features</span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-secondary tracking-tight max-w-2xl">Precision Tools for Success</h2>
            <p className="text-secondary-light font-medium max-w-xl">Our suite of AI-driven tools provides comprehensive preparation for every stage of the interview process.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card p-8 rounded-[2rem] relative overflow-hidden bg-white">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl text-primary">description</span>
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Smart CV Analysis</h3>
              <p className="text-secondary-light text-sm font-medium leading-relaxed">Instant, granular feedback on your resume. We optimize for ATS systems and highlight industry-specific strengths.</p>
            </div>
            <div className="feature-card p-8 rounded-[2rem] relative overflow-hidden bg-white ring-1 ring-primary/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 blur-2xl rounded-full"></div>
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-3xl text-white">smart_toy</span>
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Adaptive AI Interview</h3>
              <p className="text-secondary-light text-sm font-medium leading-relaxed">Experience real-time voice and video simulations with adaptive personas that react to your responses dynamically.</p>
            </div>
            <div className="feature-card p-8 rounded-[2rem] relative overflow-hidden bg-white">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-3xl text-blue-600">monitoring</span>
              </div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Deep Analytics</h3>
              <p className="text-secondary-light text-sm font-medium leading-relaxed">Visualize your growth with detailed sentiment analysis, pacing metrics, and keyword usage tracking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-32" id="faq">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Help Center</span>
          <h2 className="text-4xl font-bold text-secondary tracking-tight mt-4">Common Questions</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 group transition-all border border-slate-100 hover:border-slate-200 hover:shadow-lg cursor-pointer">
            <button className="flex items-center justify-between w-full text-left font-bold text-lg text-secondary">
              <span>How realistic are the AI simulations?</span>
              <span className="material-symbols-outlined text-primary bg-orange-50 rounded-full p-1 transition-transform duration-300 group-hover:rotate-45">add</span>
            </button>
            <p className="mt-4 text-slate-600 text-sm font-medium leading-relaxed">Our AI is trained on over 50,000 verified interview transcripts across Fortune 500 companies. It mimics nuances, interruptions, and follow-up questions specific to your target role.</p>
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-slate-500 font-medium">Still have questions? <a className="text-primary font-bold hover:underline" href="#contact">Contact Support</a></p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-slate-200" id="contact">
        <div className="grid lg:grid-cols-2 gap-20">
          <div>
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Get in Touch</span>
            <h2 className="text-5xl font-extrabold text-secondary tracking-tight mt-4 mb-8">We're here to help.</h2>
            <p className="text-lg text-secondary-light font-medium mb-12 leading-relaxed">
              Whether you're a candidate seeking guidance or an enterprise interested in our recruitment solutions, our team is ready to assist.
            </p>
            <div className="space-y-10">
              <div className="flex gap-6 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-secondary mb-1">Email us</h4>
                  <p className="text-slate-500 font-medium">support@mockmate.ai</p>
                </div>
              </div>
              <div className="flex gap-6 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl">chat</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-secondary mb-1">Live Support</h4>
                  <p className="text-slate-500 font-medium">Mon-Fri, 9am - 6pm PST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-slate-100">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full blur-3xl pointer-events-none opacity-60"></div>
            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary-light uppercase tracking-widest">Full Name</label>
                  <input className="rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 px-4 text-secondary placeholder-slate-400 transition-colors hover:bg-white" placeholder="John Doe" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary-light uppercase tracking-widest">Email Address</label>
                  <input className="rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 px-4 text-secondary placeholder-slate-400 transition-colors hover:bg-white" placeholder="john@example.com" type="email" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary-light uppercase tracking-widest">Subject</label>
                <div className="relative">
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary h-12 px-4 appearance-none text-secondary hover:bg-white transition-colors">
                    <option className="text-secondary">General Inquiry</option>
                    <option className="text-secondary">Technical Support</option>
                    <option className="text-secondary">Partnership</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary-light uppercase tracking-widest">Message</label>
                <textarea className="rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary p-4 text-secondary placeholder-slate-400 hover:bg-white transition-colors" placeholder="How can we help you?" rows={4}></textarea>
              </div>
              <button className="w-full btn-cta py-4 flex items-center justify-center rounded-xl font-bold text-lg tracking-wide mt-2 shadow-lg shadow-orange-500/20">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-secondary rounded-[3rem] p-12 lg:p-20 text-center overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/30 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/30 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
              Ready to land your <span className="text-primary">dream job?</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl font-medium">Join the elite community of professionals using MockMate's premium AI tools.</p>
            <div className="flex flex-col sm:flex-row gap-5 mt-4">
              <Link to="/register" className="btn-cta px-10 py-4 flex items-center justify-center rounded-full text-lg font-bold shadow-xl shadow-orange-500/20">
                Get Started Free
              </Link>
              <button className="bg-white/5 text-white border border-white/20 px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 pt-24 pb-12 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div>
                  <img src={logoImg} alt="MockMate Logo" className="w-10 h-10 object-cover rounded-lg" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-secondary">
                  Mock<span className="text-primary">Mate</span>
                </h2>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                Mastering the art of interviewing with advanced AI technology. Helping the next generation of talent land their dream jobs with confidence.
              </p>
              <div className="flex gap-3">
                <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all border border-slate-100 hover:border-primary" href="#">
                  <span className="material-symbols-outlined text-lg">public</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all border border-slate-100 hover:border-primary" href="#">
                  <span className="material-symbols-outlined text-lg">alternate_email</span>
                </a>
                <a className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all border border-slate-100 hover:border-primary" href="#">
                  <span className="material-symbols-outlined text-lg">share</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-6 uppercase text-[10px] tracking-[0.2em]">Product</h4>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">AI Interviewer</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">CV Optimizer</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Analytics</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-6 uppercase text-[10px] tracking-[0.2em]">Company</h4>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Our Mission</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-secondary mb-6 uppercase text-[10px] tracking-[0.2em]">Support</h4>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-500">
                <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-slate-400">© 2024 MockMate AI. All rights reserved.</p>
            <div className="flex gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <a className="hover:text-primary transition-colors" href="#">Security</a>
              <a className="hover:text-primary transition-colors" href="#">Sitemap</a>
              <a className="hover:text-primary transition-colors" href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
