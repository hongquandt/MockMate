import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/admin/users', icon: 'group', label: 'Manage Users' },
        { path: '/admin/jobs', icon: 'work', label: 'Moderate Jobs' },
        { path: '/admin/revenue', icon: 'payments', label: 'Revenue' },
        { path: '/admin/settings', icon: 'lock', label: 'Change Password' }
    ];

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col fixed left-0 top-0 shadow-2xl z-50">
            <div className="p-6 flex items-center justify-center border-b border-slate-800">
                <span className="material-symbols-outlined text-primary text-3xl mr-3">admin_panel_settings</span>
                <h1 className="text-xl font-black text-white">MockMate Admin</h1>
            </div>
            
            <nav className="flex-1 mt-6">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                            location.pathname === item.path 
                                ? 'bg-primary/20 text-primary border-r-4 border-primary' 
                                : 'hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-6 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-slate-400 hover:text-red-400 transition-colors w-full text-left"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
