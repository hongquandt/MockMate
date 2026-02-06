import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    loadUserProfile();
    
    // Check if returning from payment
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    if (status === 'success') {
      setShowSuccessMessage(true);
      // Reload profile multiple times to catch webhook update
      // PayOS webhook might take a few seconds to process
      setTimeout(() => loadUserProfile(), 2000);
      setTimeout(() => loadUserProfile(), 5000);
      setTimeout(() => loadUserProfile(), 10000);
      
      // Hide success message after 15 seconds
      setTimeout(() => setShowSuccessMessage(false), 15000);
      
      // Clean URL
      window.history.replaceState({}, '', '/profile');
    }
  }, [location]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await authService.getUserProfile();
      setUser(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-black">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-black">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Failed to load profile</p>
          <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Dummy data for stats and activity (will be replaced with real data later)
  const stats = {
    interviewsCompleted: 24,
    avgScore: 8.5,
    streak: 5,
    hoursPracticed: 12
  };

  const recentActivity = [
    { id: 1, title: "Mock Interview: Senior Frontend", date: "2 hours ago", score: 8.5, status: "Completed" },
    { id: 2, title: "CV Analysis: Tech Lead", date: "1 day ago", score: 9.0, status: "Analyzed" },
    { id: 3, title: "Mock Interview: Behavioral", date: "3 days ago", score: 7.8, status: "Completed" },
  ];

  const isVipActive = user.isVip && user.vipExpirationDate && new Date(user.vipExpirationDate) > new Date();

  return (
    <div className="flex h-screen bg-background-light dark:bg-black overflow-hidden font-display">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MockMate</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon="dashboard" label="Dashboard" to="/" />
          <NavItem icon="person" label="Profile" to="/profile" active />
          <NavItem icon="description" label="CV Analysis" to="/cv-analysis" />
          <NavItem icon="videocam" label="Interviews" to="/interviews" />
          <NavItem icon="trending_up" label="Progress" to="/progress" />
          <NavItem icon="settings" label="Settings" to="/settings" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
          <span className="font-bold text-lg dark:text-white">Profile</span>
          <button className="text-slate-500"><span className="material-symbols-outlined">menu</span></button>
        </div>

        {/* Success Message Banner */}
        {showSuccessMessage && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl animate-bounce">check_circle</span>
              <div>
                <p className="font-bold">Payment Successful!</p>
                <p className="text-sm text-green-100">Your VIP status is being updated. Please wait a moment...</p>
              </div>
              <button 
                onClick={() => {
                  setShowSuccessMessage(false);
                  loadUserProfile();
                }}
                className="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-sm transition-colors"
              >
                Refresh Now
              </button>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
          
          {/* Profile Header */}
          <div className="relative mb-20 md:mb-24">
            <div className="h-48 md:h-64 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-primary to-purple-600">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-16 left-6 md:left-10 flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6">
              <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-background-dark shadow-xl overflow-hidden bg-gradient-to-br from-primary to-purple-600">
                <div className="w-full h-full flex items-center justify-center text-white text-5xl md:text-6xl font-black">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                {isVipActive && (
                  <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-tl-xl rounded-br-xl shadow-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    <span className="font-bold text-xs">VIP</span>
                  </div>
                )}
              </div>
              <div className="mb-2 md:mb-4">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm md:drop-shadow-none md:text-black">
                  {user.fullName || 'User'}
                </h1>
                <p className="text-slate-200 md:text-slate-500 font-medium">{user.email}</p>
                {isVipActive && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1">
                    VIP until {new Date(user.vipExpirationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex-1"></div>
              <button className="mb-4 hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30">
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Info & Skills */}
            <div className="space-y-6">
              
              {/* Personal Info Card */}
              <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Personal Info</h3>
                <div className="space-y-4">
                  <InfoItem icon="mail" label="Email" value={user.email} />
                  <InfoItem icon="person" label="User ID" value={`#${user.userId}`} />
                  {isVipActive && (
                    <InfoItem icon="workspace_premium" label="VIP Status" value="Active" />
                  )}
                </div>
              </div>

              {/* Upgrade VIP Card - Only show if not VIP */}
              {!isVipActive && (
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-3xl bg-white/20 p-2 rounded-lg">workspace_premium</span>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">MockMate VIP</h3>
                      <p className="text-amber-100 text-xs">Mở khóa toàn bộ tính năng</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6 text-sm text-amber-50">
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> Phỏng vấn không giới hạn</li>
                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">check</span> AI phân tích chi tiết</li>
                  </ul>

                  <Link to="/vip-upgrade" className="block w-full py-2.5 bg-white text-amber-600 font-bold text-center rounded-xl hover:bg-amber-50 transition-colors shadow-sm">
                    Nâng cấp ngay
                  </Link>
                </div>
              )}

              {/* VIP Benefits Card - Show if VIP */}
              {isVipActive && (
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-3xl">workspace_premium</span>
                    <div>
                      <h3 className="font-bold text-lg">VIP Active</h3>
                      <p className="text-amber-100 text-xs">Expires: {new Date(user.vipExpirationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Link to="/vip-upgrade" className="block w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-center rounded-xl transition-colors">
                    Extend VIP
                  </Link>
                </div>
              )}
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="videocam" label="Interviews" value={stats.interviewsCompleted} color="text-blue-500" bg="bg-blue-500/10" />
                <StatCard icon="bolt" label="Avg Score" value={stats.avgScore} color="text-yellow-500" bg="bg-yellow-500/10" />
                <StatCard icon="local_fire_department" label="Streak" value={stats.streak + " Days"} color="text-orange-500" bg="bg-orange-500/10" />
                <StatCard icon="schedule" label="Practiced" value={stats.hoursPracticed + "h"} color="text-green-500" bg="bg-green-500/10" />
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-background-dark p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex">
                <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabButton label="Saved Questions" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
              </div>

              {/* Content Area */}
              <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
                      <div className="space-y-4">
                        {recentActivity.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(item.status)}`}>
                                <span className="material-symbols-outlined text-xl">{item.title.includes("CV") ? "description" : "videocam"}</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{item.title}</h4>
                                <p className="text-xs text-slate-400">{item.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-lg text-slate-900 dark:text-white">{item.score}/10</span>
                              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'history' && <p className="text-slate-500 text-center py-10">History content goes here...</p>}
                {activeTab === 'saved' && <p className="text-slate-500 text-center py-10">Saved questions go here...</p>}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const NavItem = ({ icon, label, to, active = false }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    {label}
  </Link>
);

const InfoItem = ({ icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-slate-400 text-xl">{icon}</span>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {isLink ? (
        <a href="#" className="text-primary hover:underline font-medium">{value}</a>
      ) : (
        <p className="text-slate-700 dark:text-slate-200 font-medium">{value}</p>
      )}
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white dark:bg-background-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:translate-y-[-2px] transition-transform">
    <div className={`h-10 w-10 ${bg} ${color} rounded-full flex items-center justify-center`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
  >
    {label}
  </button>
);

const getStatusColor = (status) => {
  switch(status) {
    case 'Completed': return 'bg-green-100 text-green-600 dark:bg-green-900/30';
    case 'Analyzed': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default UserProfilePage;
