import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { authService, adminService } from '../../services/api';

const AdminJobsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [jobsList, setJobsList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [formData, setFormData] = useState({
        categoryId: 1,
        title: '',
        description: '',
        requirements: '',
        isActive: true
    });

    useEffect(() => {
        const u = authService.getCurrentUser();
        if (!u || u.roleId !== 1) {
            navigate('/login');
        } else {
            setUser(u);
            fetchJobs();
            fetchCategories();
        }
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const data = await adminService.getJobCategories();
            setCategories(data);
        } catch (e) {
            console.error("Error fetching categories", e);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllJobs();
            setJobsList(data);
        } catch (error) {
            console.error("Error fetching jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (jobId) => {
        try {
            await adminService.toggleJobStatus(jobId);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update job status.');
        }
    };

    const handleApproveJob = async (jobId, status) => {
        try {
            await adminService.approveJob(jobId, status);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to approve job.');
        }
    };

    const handleOpenModal = (job = null) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                categoryId: job.categoryId || (categories.length > 0 ? categories[0].id : 1),
                title: job.title,
                description: job.description || '',
                requirements: job.requirements || '',
                isActive: job.isActive
            });
        } else {
            setEditingJob(null);
            setFormData({ 
                categoryId: categories.length > 0 ? categories[0].id : 1, 
                title: '', 
                description: '', 
                requirements: '', 
                isActive: true 
            });
        }
        setShowModal(true);
    };

    const handleSaveJob = async (e) => {
        e.preventDefault();
        try {
            if (editingJob) {
                await adminService.updateJob(editingJob.id, formData);
                alert('Job updated successfully!');
            } else {
                await adminService.createJob(formData);
                alert('Job created successfully!');
            }
            setShowModal(false);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save job.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job permanently?')) return;
        try {
            await adminService.deleteJob(id);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete job.');
        }
    };

    const filteredJobs = jobsList.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              j.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
                              
        let matchesStatus = true;
        if (statusFilter === 'Approved') matchesStatus = j.status === 1;
        if (statusFilter === 'Pending') matchesStatus = j.status === 0;
        if (statusFilter === 'Rejected') matchesStatus = j.status === 2;
        
        return matchesSearch && matchesStatus;
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Moderate Jobs</h1>
                    <p className="text-slate-500 mt-1">Review and approve job postings from partner companies.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between mb-6">
                        <div className="flex gap-4 w-2/3">
                            <input 
                                type="text" 
                                placeholder="Search jobs by title or category..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending Review</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                        >
                            Add Job
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-4 text-slate-500">Loading jobs...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                        <th className="py-4 px-4 font-bold">Category</th>
                                        <th className="py-4 px-4 font-bold">Position</th>
                                        <th className="py-4 px-4 font-bold">Status</th>
                                        <th className="py-4 px-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-slate-500">No jobs found.</td>
                                        </tr>
                                    ) : filteredJobs.map(j => (
                                        <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 font-bold text-slate-800 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 font-black">
                                                    {j.categoryName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div>{j.categoryName}</div>
                                                    <div className="text-xs text-slate-500 font-normal">{j.companyName}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                                                {j.title}
                                                <div className="text-xs mt-1">
                                                    <span className={`px-2 py-0.5 rounded-full ${j.isActive ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {j.isActive ? 'Company Enabled' : 'Company Disabled'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    j.status === 1 ? 'bg-green-100 text-green-600' : j.status === 2 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {j.status === 1 ? 'Approved' : j.status === 2 ? 'Rejected' : 'Pending Approval'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button onClick={() => handleOpenModal(j)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Edit">edit</button>
                                                {j.status === 0 ? (
                                                    <>
                                                        <button onClick={() => handleApproveJob(j.id, 1)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Approve">check_circle</button>
                                                        <button onClick={() => handleApproveJob(j.id, 2)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Reject">cancel</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleApproveJob(j.id, 0)} className="text-orange-500 hover:bg-orange-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Revoke Approval">undo</button>
                                                )}
                                                <button onClick={() => handleDelete(j.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Delete">delete</button>
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
                        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 material-symbols-outlined"
                            >
                                close
                            </button>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                {editingJob ? 'Edit Job' : 'Add New Job'}
                            </h2>
                            <form onSubmit={handleSaveJob} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Job Title *</label>
                                    <input 
                                        type="text" required
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Category *</label>
                                    <select 
                                        value={formData.categoryId}
                                        onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Requirements</label>
                                    <textarea 
                                        value={formData.requirements}
                                        onChange={e => setFormData({...formData, requirements: e.target.value})}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]" 
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isActive}
                                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <label className="text-sm font-medium text-slate-700 mb-1">Is Active (Approved)</label>
                                </div>
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
                                        {editingJob ? 'Update Job' : 'Create Job'}
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

export default AdminJobsPage;
