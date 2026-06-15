import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const AdminSettingsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 1) {
            navigate('/login');
        } else {
            setUser(u);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu mới không khớp.');
            return;
        }

        try {
            setLoading(true);
            const res = await authService.changePassword(formData.oldPassword, formData.newPassword);
            setMessage(res.message || 'Đổi mật khẩu thành công!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Change Password</h1>
                    <p className="text-slate-500 mt-1">Update your admin account password securely.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        Security Settings
                    </h2>

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-medium border border-green-200">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                            <input 
                                type="password" 
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" 
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminSettingsPage;
