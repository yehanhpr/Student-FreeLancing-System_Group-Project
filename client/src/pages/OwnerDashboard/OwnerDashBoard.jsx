import React, { useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Briefcase, LayoutDashboard, PlusCircle, Settings, Shield, Users, Wallet } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const navItems = [
    { to: '', end: true, icon: LayoutDashboard, label: 'Dashboard' },
    { to: 'projects', icon: Briefcase, label: 'My Projects' },
    { to: 'create-project', icon: PlusCircle, label: 'Create Project' },
    { to: 'all-applicants', icon: Users, label: 'All Applicants' },
    { to: 'owner-nda', icon: Shield, label: 'NDA Management', badge: 3 },
    { to: 'payments', icon: Wallet, label: 'Payments' },
    { to: 'owner-settings', icon: Settings, label: 'Settings' },
];

const OwnerDashBoard = () => {

    const {user} = useContext(AppContext);

    return (
        <div className='min-h-screen bg-slate-950'>
            <Navbar />

            <div className='flex'>
                {/* ── Sidebar ── */}
                <aside className='w-70 shrink-0 min-h-screen bg-slate-900 border-r border-slate-800 px-3 py-6 sticky top-16'>

                    {/* Owner mini profile */}
                    <div className='flex items-center gap-3 px-3 mb-8'>
                        <div className='w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0'>
                            {user?.name?.charAt(0) || 'TI'}
                        </div>
                        <div className='min-w-0'>
                            <p className='text-sm font-semibold text-white truncate'>{user?.name || 'TechStart Inc.'}</p>
                            <p className='text-xs text-slate-500 truncate'>Project Owner</p>
                        </div>
                    </div>

                    <p className='text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 mb-3'>Menu</p>

                    <ul className='flex flex-col gap-1'>
                        {navItems.map(({ to, end, icon: Icon, label, badge }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${isActive
                                        ? 'bg-blue-600 text-white font-medium'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`
                                }
                            >
                                <Icon className='w-4 h-4 shrink-0' />
                                <span className='flex-1'>{label}</span>
                                {badge && (
                                    <span className='text-xs bg-blue-500 text-white font-semibold px-1.5 py-0.5 rounded-full leading-none'>
                                        {badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </ul>
                </aside>

                {/* ── Main content ── */}
                <main className='flex-1 min-h-screen bg-slate-950 p-6'>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default OwnerDashBoard