import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { authService, adminService } from '../../services/api';

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSessions: 0,
        pendingJobs: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 1) { // 1 is Admin
            navigate('/login');
        } else {
            setUser(u);
            fetchStats();
        }
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back, Admin {user.fullName}</p>
                    </div>
                </header>

                {loading ? (
                    <div className="text-center text-slate-500">Loading stats...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Users', value: stats.totalUsers, icon: 'people', color: 'text-blue-500', bg: 'bg-blue-100' },
                            { label: 'Active Sessions', value: stats.activeSessions, icon: 'record_voice_over', color: 'text-green-500', bg: 'bg-green-100' },
                            { label: 'Pending Jobs', value: stats.pendingJobs, icon: 'work_history', color: 'text-orange-500', bg: 'bg-orange-100' },
                            { label: 'Revenue (VND)', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue), icon: 'attach_money', color: 'text-purple-500', bg: 'bg-purple-100' }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-slate-800 mt-2">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <span className="material-symbols-outlined">{stat.icon}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">analytics</span>
                        <h3 className="text-xl font-bold text-slate-700">System Activity Charts</h3>
                        <p className="text-slate-400 mt-2">Charts and detailed metrics will be connected in future iterations.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;
