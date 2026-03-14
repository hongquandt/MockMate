import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { authService, adminService } from '../../services/api';

const AdminUsersPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        roleId: 2, // Default to User
        isDeleted: false
    });

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 1) {
            navigate('/login');
        } else {
            setUser(u);
            fetchUsers();
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsersList(data);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        if (!window.confirm('Are you sure you want to change this user status?')) return;
        try {
            await adminService.toggleUserStatus(userId);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user status.');
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                password: '', // Leave empty for update
                roleId: user.role === 'Admin' ? 1 : user.role === 'Company' ? 3 : 2,
                isDeleted: user.isDeleted
            });
        } else {
            setEditingUser(null);
            setFormData({ fullName: '', email: '', password: '', roleId: 2, isDeleted: false });
        }
        setShowModal(true);
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await adminService.updateUser(editingUser.id, formData);
                alert('User updated successfully!');
            } else {
                await adminService.createUser(formData);
                alert('User created successfully!');
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save user.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user permanently?')) return;
        try {
            await adminService.deleteUser(id);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user.');
        }
    };

    const filteredUsers = usersList.filter(u => {
        const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
                    <p className="text-slate-500 mt-1">View, edit, and moderate user accounts (Candidates & Companies).</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between mb-6">
                        <div className="flex gap-4 w-2/3">
                            <input 
                                type="text" 
                                placeholder="Search users by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <select 
                                value={roleFilter} 
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="All">All Roles</option>
                                <option value="User">User</option>
                                <option value="Company">Company</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                        >
                            Add User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading users...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="py-4 px-4 font-bold">Name</th>
                                        <th className="py-4 px-4 font-bold">Email</th>
                                        <th className="py-4 px-4 font-bold">Role</th>
                                        <th className="py-4 px-4 font-bold">Status</th>
                                        <th className="py-4 px-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-500">No users found.</td>
                                        </tr>
                                    ) : filteredUsers.map(u => (
                                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 font-medium text-slate-800">{u.fullName}</td>
                                            <td className="py-4 px-4 text-slate-500">{u.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    u.role === 'User' ? 'bg-sky-100 text-sky-600' : 
                                                    u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                }`}>{u.role}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    !u.isDeleted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                }`}>{!u.isDeleted ? 'Active' : 'Banned'}</span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button onClick={() => handleOpenModal(u)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Edit">edit</button>
                                                {u.role !== 'Admin' && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleToggleStatus(u.id)}
                                                            className="text-orange-500 hover:bg-orange-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" 
                                                            title={!u.isDeleted ? 'Ban User' : 'Unban'}
                                                        >
                                                            {!u.isDeleted ? 'block' : 'check_circle'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(u.id)}
                                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" 
                                                            title="Delete Permanently"
                                                        >
                                                            delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 material-symbols-outlined"
                            >
                                close
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <form onSubmit={handleSaveUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
                                    <input 
                                        type="text" required
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email *</label>
                                    <input 
                                        type="email" required
                                        disabled={!!editingUser}
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50" 
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Password *</label>
                                        <input 
                                            type="password" required
                                            value={formData.password}
                                            onChange={e => setFormData({...formData, password: e.target.value})}
                                            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Role *</label>
                                    <select 
                                        value={formData.roleId}
                                        onChange={e => setFormData({...formData, roleId: parseInt(e.target.value)})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value={1}>Admin</option>
                                        <option value={2}>User</option>
                                        <option value={3}>Company</option>
                                    </select>
                                </div>
                                {editingUser && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isDeleted}
                                            onChange={e => setFormData({...formData, isDeleted: e.target.checked})}
                                        />
                                        <label className="text-sm font-medium text-slate-700 mb-1">Is Banned</label>
                                    </div>
                                )}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-xl transition-colors"
                                    >
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminUsersPage;
