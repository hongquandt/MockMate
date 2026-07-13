import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import logoImg from '../assets/img/z7430605225117_544001c3f21b8fc1cb5af11cb46703c0.jpg';

const NavItem = ({ icon, label, path, isSpecial }) => {
    const location = useLocation();
    // Match exact path or subpaths like /profile/edit
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <Link 
            to={path}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left mb-1
            ${isActive 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : isSpecial 
                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
            }`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
        </Link>
    );
};

const UserSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shrink-0 transition-colors">
            <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
                <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-lg" />
                <span className="text-xl font-bold text-slate-800 dark:text-white">MockMate</span>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
                <NavItem icon="dashboard" label="Dashboard" path="/dashboard" />
                <NavItem icon="person" label="Thông tin cá nhân" path="/profile" />
                <NavItem icon="history_edu" label="Lịch sử CV" path="/cv-history" />
                <NavItem icon="psychology" label="Test Tâm Lý (AI)" path="/emotion-test" />

                <NavItem icon="workspace_premium" label="Nâng cấp VIP" path="/vip-upgrade" isSpecial />
                <NavItem icon="home" label="Trang chủ" path="/" />
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-medium">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default UserSidebar;
