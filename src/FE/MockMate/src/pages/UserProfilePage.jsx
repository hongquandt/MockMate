import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dummy user data
  const user = {
    name: "Alex Johnson",
    role: "Senior React Developer",
    email: "alex.johnson@example.com",
    location: "Hanoi, Vietnam",
    joinDate: "September 2023",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    stats: {
      interviewsCompleted: 24,
      avgScore: 8.5,
      streak: 5,
      hoursPracticed: 12
    },
    skills: ["React", "Node.js", "System Design", "AWS", "TypeScript"],
    recentActivity: [
      { id: 1, title: "Mock Interview: Senior Frontend", date: "2 hours ago", score: 8.5, status: "Completed" },
      { id: 2, title: "CV Analysis: Tech Lead", date: "1 day ago", score: 9.0, status: "Analyzed" },
      { id: 3, title: "Mock Interview: Behavioral", date: "3 days ago", score: 7.8, status: "Completed" },
    ]
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-black overflow-hidden font-display">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MockMate</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="person" label="Profile" active />
          <NavItem icon="description" label="CV Analysis" />
          <NavItem icon="videocam" label="Interviews" />
          <NavItem icon="trending_up" label="Progress" />
          <NavItem icon="settings" label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 transition-colors">
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

        <div className="max-w-5xl mx-auto p-4 md:p-8 pb-20">
          
          {/* Profile Header */}
          <div className="relative mb-20 md:mb-24">
            <div className="h-48 md:h-64 w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
              <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            
            <div className="absolute -bottom-16 left-6 md:left-10 flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white dark:border-background-dark shadow-xl overflow-hidden bg-white">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="mb-2 md:mb-4">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm md:drop-shadow-none md:text-black">{user.name}</h1>
                <p className="text-slate-200 md:text-slate-500 font-medium">{user.role}</p>
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
                  <InfoItem icon="location_on" label="Location" value={user.location} />
                  <InfoItem icon="calendar_today" label="Joined" value={user.joinDate} />
                  <InfoItem icon="language" label="Website" value="alexjohnson.dev" isLink />
                </div>
              </div>

              {/* Skills Card */}
              <div className="bg-white dark:bg-background-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">Skills</h3>
                  <button className="text-primary text-sm font-bold hover:underline">Add New</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700">
                      {skill}
                    </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 rounded-full text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="videocam" label="Interviews" value={user.stats.interviewsCompleted} color="text-blue-500" bg="bg-blue-500/10" />
                <StatCard icon="bolt" label="Avg Score" value={user.stats.avgScore} color="text-yellow-500" bg="bg-yellow-500/10" />
                <StatCard icon="local_fire_department" label="Streak" value={user.stats.streak + " Days"} color="text-orange-500" bg="bg-orange-500/10" />
                <StatCard icon="schedule" label="Practiced" value={user.stats.hoursPracticed + "h"} color="text-green-500" bg="bg-green-500/10" />
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
                        {user.recentActivity.map((item) => (
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

                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">Weekly Goal: 3 Interviews</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">You have completed 1 out of 3 interviews this week. Keep it up!</p>
                      </div>
                      <div className="h-12 w-12 relative flex items-center justify-center">
                         <svg className="transform -rotate-90 w-12 h-12">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="125.6" strokeDashoffset="83.7" className="text-primary" />
                         </svg>
                         <span className="absolute text-xs font-bold text-primary">33%</span>
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
const NavItem = ({ icon, label, active = false }) => (
  <Link to="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
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
