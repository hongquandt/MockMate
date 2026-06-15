import React, { useEffect, useState } from 'react';
import CompanySidebar from '../../components/CompanySidebar';
import { useNavigate } from 'react-router-dom';
import { authService, companyService } from '../../services/api';

const CompanyDashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalCandidates: 0,
        pendingReviews: 0
    });

    useEffect(() => {
        const u = authService.getCurrentUser();
        // Assuming roleId 3 is Company
        if (!u || u.roleId !== 3) {
            navigate('/login');
        } else {
            setUser(u);
            fetchStats();
        }
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const data = await companyService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch company stats", error);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <CompanySidebar />
            
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.fullName}!</h1>
                        <p className="text-slate-500 mt-1">Here is your recruitment overview.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Total Job Postings</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalJobs}</h3>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Active Jobs</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.activeJobs}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Total Candidates</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.totalCandidates}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Pending Reviews</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.pendingReviews}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                    <img src="https://cdni.iconscout.com/illustration/premium/thumb/recruitment-process-4487293-3738450.png" alt="Recruitment" className="w-64 h-auto mx-auto mb-6 drop-shadow-sm opacity-90" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Find the Perfect Candidate</h2>
                    <p className="text-slate-500 max-w-lg mx-auto mb-6">
                        Start discovering verified talent based on their AI mock interview sessions. 
                        Create a new job posting to let candidates practice directly with your requirements.
                    </p>
                    <button onClick={() => navigate('/company/jobs')} className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors">
                        Manage Job Postings
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CompanyDashboardPage;
