import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
    LayoutDashboard, Users, Building2, Briefcase, FileText,
    FileSignature, Trash2, Search, Activity, ChevronRight,
    Loader2, LogOut,
    ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const { token, role, setToken } = useContext(AppContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState(null);
    const [data, setData] = useState({
        students: [],
        recruiters: [],
        projects: [],
        applications: [],
        ndas: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null); // For view details
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: '' });

    // Protect Route
    useEffect(() => {
        if (!token) {
            navigate('/admin-login');
        } else if (role !== null && role !== 'admin') {
            toast.error('Unauthorized access');
            navigate('/');
        }
    }, [token, role, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            // Fetch stats
            const statsRes = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/stats`, { headers });
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats(statsData.stats);
                setRecentActivity(statsData.recentActivity);
            }

            // Fetch all other lists
            const [studentsRes, recruitersRes, projectsRes, appsRes, ndasRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/students`, { headers }),
                fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/recruiters`, { headers }),
                fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/projects`, { headers }),
                fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/applications`, { headers }),
                fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/ndas`, { headers })
            ]);

            const [studentsData, recruitersData, projectsData, appsData, ndasData] = await Promise.all([
                studentsRes.json(), recruitersRes.json(), projectsRes.json(), appsRes.json(), ndasRes.json()
            ]);

            setData({
                students: studentsData.success ? studentsData.students : [],
                recruiters: recruitersData.success ? recruitersData.recruiters : [],
                projects: projectsData.success ? projectsData.projects : [],
                applications: appsData.success ? appsData.applications : [],
                ndas: ndasData.success ? ndasData.ndas : []
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && role === 'admin') {
            fetchDashboardData();
        }
    }, [token, role]);

    const openDeleteConfirm = (type, id, name) => {
        setDeleteConfirm({ open: true, type, id, name });
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirm({ open: false, type: null, id: null, name: '' });
    };

    const handleDelete = async () => {
        const { type, id } = deleteConfirm;
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/${type}s/${id}`, {
                method: 'DELETE',
                headers
            });
            const result = await res.json();

            if (result.success) {
                toast.success(`${type} deleted successfully`);
                setData(prev => ({
                    ...prev,
                    [`${type}s`]: prev[`${type}s`].filter(item => item._id !== id)
                }));
                fetchDashboardData();
            } else {
                toast.error(result.message || 'Deletion failed');
            }
        } catch (error) {
            toast.error('An error occurred during deletion');
        } finally {
            closeDeleteConfirm();
        }
    };

    if (role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    const renderSidebar = () => (
        <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 flex flex-col pt-5 shadow-sm z-10">
            <div className="p-6 flex-1 flex flex-col h-full">
                <h2 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6" />
                    Admin Panel
                </h2>
                <nav className="space-y-2 flex-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'students', label: 'Students', icon: Users },
                        { id: 'recruiters', label: 'Recruiters', icon: Building2 },
                        { id: 'projects', label: 'Projects', icon: Briefcase },
                        { id: 'applications', label: 'Applications', icon: FileText },
                        { id: 'ndas', label: 'NDAs', icon: FileSignature },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSearchTerm(''); setSelectedUser(null); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium
                                ${activeTab === item.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto border-t border-gray-100 pt-4">
                    <button
                        onClick={() => {
                            setToken(null);
                            localStorage.removeItem('token');
                            navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </div>
        </aside>
    );

    const renderOverview = () => {
        if (!stats) return <EmptyState message="No stats available" />;

        const barData = [
            { name: 'Students', count: stats.students },
            { name: 'Recruiters', count: stats.recruiters },
            { name: 'Projects', count: stats.projects },
            { name: 'Applications', count: stats.applications },
            { name: 'NDAs', count: stats.ndas },
        ];

        const pieData = [
            { name: 'Students', value: stats.students },
            { name: 'Recruiters', value: stats.recruiters },
        ];
        const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#ef4444'];

        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-800">Platform Analytics</h3>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h4 className="text-lg font-bold text-gray-800 mb-6">Platform Entities</h4>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <RechartsTooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h4 className="text-lg font-bold text-gray-800 mb-6">User Distribution</h4>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % 2]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h4 className="text-lg font-bold text-gray-800">Recent Projects</h4>
                        </div>
                        <div className="space-y-4">
                            {recentActivity?.projects?.length > 0 ? recentActivity.projects.map(proj => (
                                <div key={proj._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{proj.title}</p>
                                        <p className="text-sm text-gray-500">{proj.recruiter?.companyName || 'Unknown Company'}</p>
                                    </div>
                                    <span className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                                        {proj.status}
                                    </span>
                                </div>
                            )) : <EmptyState message="No recent projects" />}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h4 className="text-lg font-bold text-gray-800">Newest Students</h4>
                        </div>
                        <div className="space-y-4">
                            {recentActivity?.students?.length > 0 ? recentActivity.students.map(std => (
                                <div key={std._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                                            {std.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{std.name}</p>
                                            <p className="text-sm text-gray-500">{std.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : <EmptyState message="No recent students" />}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTable = (type) => {
        let list = data[type] || [];

        // Search filter
        if (searchTerm) {
            list = list.filter(item => {
                const searchStr = searchTerm.toLowerCase();
                return (item.name?.toLowerCase().includes(searchStr) ||
                    item.email?.toLowerCase().includes(searchStr) ||
                    item.title?.toLowerCase().includes(searchStr) ||
                    item.companyName?.toLowerCase().includes(searchStr));
            });
        }

        if (list.length === 0) return <EmptyState message={`No ${type} found.`} />;

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={`Search ${type}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                        Total: {list.length}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm">
                                <th className="p-4 font-semibold">Name / Title</th>
                                <th className="p-4 font-semibold">Details</th>
                                <th className="p-4 font-semibold">Date Joined</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {list.map(item => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-semibold text-gray-800">
                                            {item.name || item.title || (item.studentId?.name + ' - Application')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {item.email || item.category || (item.projectId?.title)}
                                        </p>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-gray-600">
                                            {item.university || item.companyName || `Status: ${item.status || item.ndaStatus}`}
                                        </p>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 flex items-center justify-center gap-3">
                                        {(type === 'students' || type === 'recruiters' || type === 'projects') && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedUser(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(
                                                        type.slice(0, -1),
                                                        item._id,
                                                        item.name || item.title || 'this item'
                                                    )}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        
                    </table>
                </div>
            </div>
        );
    };

    const renderUserDetails = () => {
        if (!selectedUser) return null;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Details</h3>
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to List
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(selectedUser).map(([key, value]) => {
                        if (['password', '_id', '__v'].includes(key)) return null;
                        if (typeof value === 'object') return null; // simplify viewing
                        return (
                            <div key={key} className="border-b border-gray-200 pb-3">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{key}</p>
                                <p className="text-gray-800 font-medium break-all">{String(value) || 'N/A'}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        );
    };

    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{message}</p>
        </div>
    );

    const DeleteConfirmModal = () => {
        if (!deleteConfirm.open) return null;
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm mx-4 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
                    <p className="text-gray-500 text-sm mb-1">You are about to permanently delete:</p>
                    <p className="text-gray-800 font-semibold mb-6 break-all">"{deleteConfirm.name}"</p>
                    <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={closeDeleteConfirm}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {renderSidebar()}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal />

            <main className="flex-1 ml-64 p-8 pt-10">
                {loading ? (
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-800 capitalize">
                                {activeTab} Management
                            </h1>
                        </div>

                        {activeTab === 'overview' && renderOverview()}

                        {activeTab !== 'overview' && !selectedUser && (
                            <div className="space-y-6">
                                {renderTable(activeTab)}
                            </div>
                        )}

                        {selectedUser && renderUserDetails()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
