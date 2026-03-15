import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/api";

const CompanySidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
    };

    const menuItems = [
        { path: '/company/dashboard', icon: 'dashboard', label: 'Dashboard' },
        { path: '/company/jobs', icon: 'work', label: 'My Job Postings' },
        { path: '/company/candidates', icon: 'group', label: 'Candidate Pool' }
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed top-0 left-0 flex flex-col justify-between hidden md:flex">
            <div>
                <div className="p-6">
                    <Link to="/" className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="bg-primary text-white w-8 h-8 rounded-lg flex items-center justify-center">M</span>
                        MockMate <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-md ml-1">Company</span>
                    </Link>
                </div>
                <nav className="px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                    isActive 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            
            <div className="p-4 border-t border-slate-100">
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default CompanySidebar;
