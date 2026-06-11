import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Mail, Lock, User, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { setToken, token, role } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && role === 'admin') {
            navigate('/admin-dashboard');
        }
    }, [token, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isRegister ? `${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/register` : `${import.meta.env.VITE_REACT_BACKEND_URL}/api/admin/login`;
            const payload = isRegister ? { name, email, password } : { email, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.success) {
                toast.success(isRegister ? 'Registration successful' : 'Login successful');
                localStorage.setItem('token', data.token);
                setToken(data.token);
                window.location.href = '/admin-dashboard'; // Hard reload to ensure context picks up new token securely if needed
            } else {
                toast.error(data.message || 'Authentication failed');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-200">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            {isRegister ? 'Create your admin account' : 'Sign in to access dashboard'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition-all"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-600 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                        >
                            {isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        {isRegister ? 'Already have an admin account? ' : 'Need an admin account? '}
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            {isRegister ? 'Sign in' : 'Register'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
