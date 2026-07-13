import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { authService, adminService } from '../../services/api';

const AdminRevenuePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        vipRevenue: 0,
        jobPostingRevenue: 0,
        totalTransactions: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 1) {
            navigate('/login');
        } else {
            setUser(u);
            fetchData();
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, txnsData] = await Promise.all([
                adminService.getRevenueStats(),
                adminService.getRecentTransactions()
            ]);
            setStats(statsData);
            setTransactions(txnsData);
        } catch (error) {
            console.error("Error fetching revenue data", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // Pagination
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Revenue Management</h1>
                    <p className="text-slate-500 mt-1">Track VIP subscriptions and company recruiting packages.</p>
                </header>

                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading revenue data...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-slate-500 font-medium">Total Revenue</h3>
                                    <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-lg">account_balance</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{formatCurrency(stats.totalRevenue)}</p>
                                <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium">
                                    <span className="material-symbols-outlined text-sm">trending_up</span> {stats.totalTransactions} transactions
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-slate-500 font-medium">VIP Subscriptions</h3>
                                    <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-lg">star</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{formatCurrency(stats.vipRevenue)}</p>
                                <p className="text-sm text-slate-400 mt-2 font-medium">From User (Candidates)</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-slate-500 font-medium">Job Postings</h3>
                                    <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-lg">work</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{formatCurrency(stats.jobPostingRevenue)}</p>
                                <p className="text-sm text-slate-400 mt-2 font-medium">From Company Accounts</p>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">All Transactions</h2>
                                <span className="text-sm text-slate-500">
                                    Showing {transactions.length > 0 ? startIndex + 1 : 0}–{Math.min(endIndex, transactions.length)} of {transactions.length}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                            <th className="py-4 px-4 font-bold">Transaction ID</th>
                                            <th className="py-4 px-4 font-bold">User / Company</th>
                                            <th className="py-4 px-4 font-bold">Type</th>
                                            <th className="py-4 px-4 font-bold">Date</th>
                                            <th className="py-4 px-4 font-bold text-right">Amount (VND)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTransactions.map(t => (
                                            <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-slate-700">{t.transactionCode}</td>
                                                <td className="py-4 px-4">{t.userEmail}</td>
                                                <td className="py-4 px-4">
                                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">{t.type}</span>
                                                </td>
                                                <td className="py-4 px-4 text-slate-500">{new Date(t.transactionDate).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 text-right font-black text-slate-800">
                                                    {formatCurrency(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {[...Array(Math.max(1, totalPages))].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${currentPage === totalPages || totalPages === 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                                >
                                    Next
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminRevenuePage;
