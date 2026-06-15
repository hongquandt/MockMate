import React, { useEffect, useState } from 'react';
import CompanySidebar from '../../components/CompanySidebar';
import { useNavigate } from 'react-router-dom';
import { authService, companyService } from '../../services/api';

const CompanyJobsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [jobsList, setJobsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        if (!u || u.roleId !== 3) {
            navigate('/login');
        } else {
            setUser(u);
            fetchJobs();
            fetchCategories();
        }
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const data = await companyService.getJobCategories();
            setCategories(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await companyService.getMyJobs();
            setJobsList(data);
        } catch (error) {
            console.error("Error fetching my jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (jobId) => {
        try {
            await companyService.toggleJobStatus(jobId);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update job status.');
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
                await companyService.updateJob(editingJob.id, formData);
                alert('Job updated successfully!');
            } else {
                await companyService.createJob(formData);
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
            await companyService.deleteJob(id);
            fetchJobs();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete job.');
        }
    };

    const filteredJobs = jobsList.filter(j => 
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <CompanySidebar />
            <main className="flex-1 ml-64 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Job Postings</h1>
                    <p className="text-slate-500 mt-1">Create and manage your recruitment tests for candidates.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex justify-between mb-6">
                        <input 
                            type="text" 
                            placeholder="Search jobs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-slate-200 rounded-xl px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button 
                            onClick={() => handleOpenModal()} 
                            className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                        >
                            Post New Job
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
                                        <th className="py-4 px-4 font-bold text-center">Candidates</th>
                                        <th className="py-4 px-4 font-bold">Visibility</th>
                                        <th className="py-4 px-4 font-bold">Admin Status</th>
                                        <th className="py-4 px-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-slate-500">No jobs posted yet.</td>
                                        </tr>
                                    ) : filteredJobs.map(j => (
                                        <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-4 px-4 font-bold text-slate-800">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs mr-2">{j.categoryName}</span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-700 font-medium">{j.title}</td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{j.candidateCount}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    j.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {j.isActive ? 'Active' : 'Hidden'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    j.status === 1 ? 'bg-green-100 text-green-600' : j.status === 2 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {j.status === 1 ? 'Approved' : j.status === 2 ? 'Rejected' : 'Pending Review'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button onClick={() => navigate(`/company/candidates?jobId=${j.id}`)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="View Candidates">visibility</button>
                                                <button onClick={() => handleOpenModal(j)} className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors material-symbols-outlined ml-1" title="Edit">edit</button>
                                                <button onClick={() => handleToggleStatus(j.id)} className={`${j.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'} p-2 rounded-lg transition-colors material-symbols-outlined ml-1`} title={j.isActive ? 'Hide Job' : 'Show Job'}>
                                                    {j.isActive ? 'visibility_off' : 'visibility'}
                                                </button>
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
                                {editingJob ? 'Edit Job Posting' : 'Create Job Posting'}
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
                                    <label className="text-sm font-medium text-slate-700 mb-1">Is Active (Visible to Candidates)</label>
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
                                        {editingJob ? 'Save Changes' : 'Post Job'}
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

export default CompanyJobsPage;
