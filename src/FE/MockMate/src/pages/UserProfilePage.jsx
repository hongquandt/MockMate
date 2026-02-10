import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService, interviewService } from '../services/api';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Data states
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        avatarUrl: ''
    });

    useEffect(() => {
        loadUserProfile();

        // Check if returning from payment
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status === 'success') {
            setShowSuccessMessage(true);
            setTimeout(() => loadUserProfile(), 2000);
            setTimeout(() => setShowSuccessMessage(false), 10000);
            window.history.replaceState({}, '', '/profile');
        }
    }, [location]);

    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const profileData = await authService.getUserProfile();
            setUser(profileData);
            setFormData({
                fullName: profileData.fullName || '',
                phoneNumber: profileData.phoneNumber || '',
                avatarUrl: profileData.avatarUrl || ''
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            setHistoryLoading(true);
            const data = await interviewService.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await authService.updateProfile(formData);
            alert("Profile updated successfully!");
            setEditMode(false);
            loadUserProfile(); // Reload to refresh data
        } catch (error) {
            alert("Failed to update profile: " + error.message);
        }
    };

    const handleLogout = () => {
        authService.logout();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="mt-4 text-slate-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const isVipActive = user.isVip && user.vipExpirationDate && new Date(user.vipExpirationDate) > new Date();

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
                    <span className="text-lg font-bold text-slate-800">MockMate</span>
                </div>
                
                <nav className="flex-1 px-4 space-y-2 mt-6">
                    <NavItem 
                        icon="dashboard" 
                        label="Dashboard" 
                        onClick={() => navigate('/dashboard')} 
                    />
                    <NavItem 
                        icon="person" 
                        label="Thông tin cá nhân" 
                        active={activeTab === 'overview' || activeTab === 'edit'} 
                        onClick={() => setActiveTab('overview')} 
                    />
                    <NavItem 
                        icon="history" 
                        label="Lịch sử phỏng vấn" 
                        active={activeTab === 'history'} 
                        onClick={() => setActiveTab('history')} 
                    />
                    <NavItem 
                        icon="workspace_premium" 
                        label="Nâng cấp VIP" 
                        active={false}
                        onClick={() => navigate('/vip-upgrade')}
                        isSpecial
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-20">
                    <span className="font-bold text-lg">Profile</span>
                    <button className="text-slate-500"><span className="material-symbols-outlined">menu</span></button>
                </div>

                {showSuccessMessage && (
                    <div className="bg-green-600 text-white px-6 py-3 shadow-lg flex justify-between items-center">
                         <span>Thanh toán thành công! Tài khoản VIP của bạn đang được cập nhật.</span>
                         <button onClick={() => setShowSuccessMessage(false)}><span className="material-symbols-outlined">close</span></button>
                    </div>
                )}

                <div className="max-w-4xl mx-auto p-6 md:p-10">
                    
                    {/* Header Banner */}
                    <div className="relative mb-12">
                        <div className="h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg relative">
                            {/* Abstract Pattern */}
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        </div>
                        
                        <div className="absolute -bottom-10 left-8 md:left-12 flex items-end gap-6">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-xl">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400 bg-slate-100">
                                            {user.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => { setActiveTab('edit'); setEditMode(true); }}
                                    className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full shadow-lg hover:scale-105 transition-transform text-white border-4 border-white"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{user.fullName}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-2">
                                    {user.email}
                                    {isVipActive && (
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded uppercase border border-amber-200">VIP</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area Based on Tab */}
                    <div className="mt-16">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Personal Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                                                <span className="material-symbols-outlined text-purple-600">person</span>
                                                Thông tin cá nhân
                                            </h3>
                                            <button 
                                                onClick={() => { setActiveTab('edit'); setEditMode(true); }}
                                                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <InfoRow label="Họ và tên" value={user.fullName} />
                                            <InfoRow label="Email" value={user.email} />
                                            <InfoRow label="Số điện thoại" value={user.phoneNumber || 'Chưa cập nhật'} />
                                            <InfoRow label="Trạng thái VIP" value={isVipActive ? `Hết hạn: ${new Date(user.vipExpirationDate).toLocaleDateString()}` : 'Chưa kích hoạt'} 
                                                isVip={isVipActive} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Quick Stats/Actions */}
                                <div className="space-y-6">
                                    {!isVipActive && (
                                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                            <h3 className="font-bold text-lg mb-2">Nâng cấp VIP</h3>
                                            <p className="text-amber-100 text-sm mb-4">Mở khóa phỏng vấn không giới hạn và AI phân tích chuyên sâu.</p>
                                            <button 
                                                onClick={() => navigate('/vip-upgrade')}
                                                className="w-full py-2 bg-white text-orange-600 font-bold rounded-lg shadow hover:bg-amber-50 transition-colors"
                                            >
                                                Xem gói cước
                                            </button>
                                        </div>
                                    )}
                                    
                                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                        <h3 className="font-bold mb-4 text-slate-800">Hoạt động gần đây</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm text-slate-500">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                Đăng nhập thành công
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'edit' && (
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <button onClick={() => setActiveTab('overview')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                                        <span className="material-symbols-outlined">arrow_back</span>
                                    </button>
                                    <h3 className="font-bold text-xl text-slate-800">Chỉnh sửa hồ sơ</h3>
                                </div>
                                
                                <form onSubmit={handleUpdateProfile} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Họ và tên</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-[20px]">person</span>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-slate-900"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-[20px]">phone</span>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-slate-900"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Avatar URL (Link ảnh)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-slate-400 material-symbols-outlined text-[20px]">image</span>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-slate-900"
                                                value={formData.avatarUrl}
                                                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                                                placeholder="https://example.com/avatar.jpg"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            type="submit" 
                                            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25"
                                        >
                                            Lưu thay đổi
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('overview')}
                                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-slate-800">
                                    <span className="material-symbols-outlined text-blue-600">history</span>
                                    Lịch sử phỏng vấn
                                </h3>
                                
                                {historyLoading ? (
                                    <div className="text-center py-10 text-slate-500">Đang tải lịch sử...</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                        <p className="text-slate-500 mb-4">Bạn chưa có buổi phỏng vấn nào.</p>
                                        <button 
                                            onClick={() => navigate('/dashboard')}
                                            className="px-4 py-2 bg-purple-600 rounded-lg text-white font-bold hover:bg-purple-700"
                                        >
                                            Bắt đầu ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map(session => (
                                            <div key={session.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-slate-800">Phỏng vấn #{session.id}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded border ${session.status === 1 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                            {session.status === 1 ? 'Hoàn thành' : 'Đang thực hiện'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500">Ngày: {new Date(session.startedAt).toLocaleString('vi-VN')}</p>
                                                </div>
                                                <button 
                                                    onClick={() => navigate('/history')} 
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Components
const NavItem = ({ icon, label, active, onClick, isSpecial }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left mb-1
        ${active 
            ? 'bg-purple-100 text-purple-700' 
            : isSpecial 
                ? 'text-amber-600 hover:bg-amber-50' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
        <span className="material-symbols-outlined">{icon}</span>
        {label}
    </button>
);

const InfoRow = ({ label, value, isVip }) => (
    <div className="flex justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded transition-colors">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className={`font-medium ${isVip ? 'text-amber-600 font-bold' : 'text-slate-900'}`}>{value}</span>
    </div>
);

export default UserProfilePage;
