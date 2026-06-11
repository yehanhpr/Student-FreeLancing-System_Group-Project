import {
  ArrowLeft, ArrowRight, Briefcase, CheckCircle, Clock,
  FileText, Shield, TrendingUp, Upload, Wallet
} from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ── Static data ─────────────────────────────────────────────────────────────

const quickActions = [
  { icon: Briefcase, label: 'Browse Projects', to: 'browse-projects', color: 'bg-blue-500/10 text-blue-400' },
  { icon: Shield, label: 'NDA Requests', to: 'nda-requests', color: 'bg-yellow-500/10 text-yellow-400', badge: 2 },
  { icon: Wallet, label: 'My Wallet', to: 'wallet', color: 'bg-purple-500/10 text-purple-400' },
  { icon: Upload, label: 'Submissions', to: 'submissions', color: 'bg-green-500/10 text-green-400' },
]



const SectionHeader = ({ title, action, onAction }) => (
  <div className='flex items-center justify-between mb-4'>
    <h2 className='text-base font-semibold text-white'>{title}</h2>
    {action && (
      <button onClick={onAction} className='flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors'>
        {action} <ArrowRight className='w-3 h-3' />
      </button>
    )}
  </div>
)

const formatPieData = (countsObj) => {
  if (!countsObj) return [];
  return Object.keys(countsObj)
    .filter(key => key !== 'total' && countsObj[key] != null)
    .map(key => ({
      name: key.replace(/_/g, ' '),
      value: countsObj[key]
    }));
};

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#2dd4bf', '#fbbf24'];

const renderCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded-lg shadow-xl text-xs">
        <p className="text-white font-medium capitalize">{`${payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();

  const { user, token, role, recommendedProjects, fetchingRecommendations } = useContext(AppContext);

  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState(null);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 3;

  const [activeProjectsPage, setActiveProjectsPage] = useState(1);
  const [recentAppsPage, setRecentAppsPage] = useState(1);


  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const activeApplications = myApplications
    .filter(application => application?.projectId?.status?.toLowerCase() === 'in progress' || application?.projectId?.status?.toLowerCase() === 'completed')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const recentApplications = myApplications
    .filter(application => application?.status === 'applied' || application?.status === 'rejected')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Active projects pagination
  const activeTotalPages = Math.ceil(activeApplications.length / ITEMS_PER_PAGE);
  const activeStart = (activeProjectsPage - 1) * ITEMS_PER_PAGE;
  const currentActiveApplications = activeApplications.slice(activeStart, activeStart + ITEMS_PER_PAGE);

  // Recent applications pagination
  const recentTotalPages = Math.ceil(recentApplications.length / ITEMS_PER_PAGE);
  const recentStart = (recentAppsPage - 1) * ITEMS_PER_PAGE;
  const currentRecentApplications = recentApplications.slice(recentStart, recentStart + ITEMS_PER_PAGE);

  const getMyApplications = async () => {

    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/applied-projects`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMyApplications(data.applications);
      }

    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const getStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats || data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };


  useEffect(() => {
    if (token && role === 'student') {
      getMyApplications();
      getStats();
    }
  }, [token, role]);




  return (
    <div className='space-y-6'>

      {/* ── Welcome banner ── */}
      <div className='relative rounded-2xl overflow-hidden bg-linear-to-r from-blue-600 to-blue-800 p-6'>
        {/* grid texture */}
        <div className='absolute inset-0 opacity-10'
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.2) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* glow */}
        <div className='absolute -top-10 -right-10 w-48 h-48 bg-blue-400/30 rounded-full blur-3xl pointer-events-none' />

        <div className='relative z-10 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-white mb-1'>Welcome back, {user?.name || 'Alex'}!</h1>
            <p className='text-blue-200 text-sm'>Here's what's happening with your projects today.</p>
          </div>

        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-2'>Project Status</h3>
          <div className='h-48 w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatPieData(stats?.projects)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {formatPieData(stats?.projects).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-2'>Application Status</h3>
          <div className='h-48 w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatPieData(stats?.applications)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {formatPieData(stats?.applications).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
          <h3 className='text-sm font-semibold text-white mb-2'>NDA Status</h3>
          <div className='h-48 w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatPieData(stats?.ndas)} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {formatPieData(stats?.ndas).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={renderCustomTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'capitalize' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Main two-column grid ── */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>

        {/* LEFT — 2/3 width */}
        <div className='xl:col-span-2 space-y-6'>

          {/* Active Projects */}
          <div className='bg-slate-900 border border-slate-800 h-[50%] rounded-2xl p-5'>
            <SectionHeader title='Active Projects' action='View All' onAction={() => navigate('applied-projects')} />
            <div className='space-y-4'>
              {activeApplications.length === 0 && (
                <div className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4'>
                  <p className='text-sm text-slate-400'>No active projects in progress.</p>
                </div>
              )}
              {currentActiveApplications.map(application => (
                <div key={application._id} className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer' onClick={() => navigate('applied-projects') }>
                  <div className='flex items-start justify-between mb-3'>
                    <div>
                      <p className='text-sm font-medium text-white mb-0.5'>{application?.projectId?.title || 'Untitled Project'}</p>
                      <p className='text-xs text-slate-500'>{application?.projectId?.recruiter?.companyName || 'Unknown company'}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-blue-400'>${application?.projectId?.budget || 0}</p>
                      <div className='flex items-center gap-1 justify-end mt-1'>
                        <Clock className='w-3 h-3 text-slate-500' />
                        <p className='text-xs text-slate-500'>{formatDate(application?.projectId?.deadline)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {activeTotalPages > 1 && (
              <div className='grid grid-cols-4 mt-4'>
                <div className='flex items-center justify-center gap-1 col-span-3 col-start-2'>
                  <button
                    onClick={() => setActiveProjectsPage(prev => Math.max(prev - 1, 1))}
                    disabled={activeProjectsPage === 1}
                    className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${activeProjectsPage === 1 && 'opacity-40 cursor-not-allowed'}`}>
                    <ArrowLeft className='w-4 h-4' />
                  </button>
                  {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setActiveProjectsPage(page)}
                      className={`border text-primary w-8 h-8 rounded cursor-pointer ${activeProjectsPage === page && 'bg-primary border-primary text-white'}`}>
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setActiveProjectsPage(prev => Math.min(prev + 1, activeTotalPages))}
                    disabled={activeProjectsPage === activeTotalPages}
                    className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${activeProjectsPage === activeTotalPages && 'opacity-40 cursor-not-allowed'}`}>
                    <ArrowRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className='bg-slate-900 border border-slate-800 h-[46%] rounded-2xl p-5'>
            <SectionHeader title='Recent Applications' action='View All' onAction={() => navigate('applied-projects')} />
            <div className='space-y-2'>
              {recentApplications.length === 0 && (
                <div className='py-3'>
                  <p className='text-sm text-slate-400'>No recently applied projects.</p>
                </div>
              )}
              {currentRecentApplications.map(application => (
                <div key={application._id} className='flex items-center justify-between py-3 border-b last:border-0 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer'>
                  <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center shrink-0'>
                      <Briefcase className='w-3.5 h-3.5 text-slate-400' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-white'>{application?.projectId?.title || 'Untitled Project'}</p>
                      <div className='flex items-center gap-2 mt-0.5'>
                        <span className='text-xs text-blue-400 font-medium'>${application?.projectId?.budget || 0}</span>
                        <span className='text-slate-600'>·</span>
                        <span className='text-xs text-slate-500'>{formatDate(application?.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className='text-xs font-medium px-3 py-1 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/20'>
                    {application?.status}
                  </span>
                </div>
              ))}
            </div>
            {recentTotalPages > 1 && (
              <div className='grid grid-cols-4 mt-4'>
                <div className='flex items-center justify-center gap-1 col-span-3 col-start-2'>
                  <button
                    onClick={() => setRecentAppsPage(prev => Math.max(prev - 1, 1))}
                    disabled={recentAppsPage === 1}
                    className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${recentAppsPage === 1 && 'opacity-40 cursor-not-allowed'}`}>
                    <ArrowLeft className='w-4 h-4' />
                  </button>
                  {Array.from({ length: recentTotalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setRecentAppsPage(page)}
                      className={`border text-primary w-8 h-8 rounded cursor-pointer ${recentAppsPage === page && 'bg-primary border-primary text-white'}`}>
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setRecentAppsPage(prev => Math.min(prev + 1, recentTotalPages))}
                    disabled={recentAppsPage === recentTotalPages}
                    className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${recentAppsPage === recentTotalPages && 'opacity-40 cursor-not-allowed'}`}>
                    <ArrowRight className='w-4 h-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — 1/3 width */}
        <div className='space-y-5'>

          {/* Quick Actions */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
            <h2 className='text-base font-semibold text-white mb-4'>Quick Actions</h2>
            <div className='space-y-2'>
              {quickActions.map(({ icon: Icon, label, to, color, badge }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className='w-full flex items-center gap-3 px-4 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/30 rounded-xl transition-all text-left'
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon className='w-3.5 h-3.5' />
                  </div>
                  <span className='text-sm text-slate-300 flex-1'>{label}</span>
                  {badge && (
                    <span className='text-xs bg-blue-600 text-white font-semibold px-1.5 py-0.5 rounded-full'>{badge}</span>
                  )}
                  <ArrowRight className='w-3.5 h-3.5 text-slate-600' />
                </button>
              ))}
            </div>
          </div>

          {/* Profile completion */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-base font-semibold text-white'>Profile Strength</h2>
              <span className='text-sm font-bold text-blue-400'>78%</span>
            </div>
            <div className='mt-4 space-y-2'>
              {[
                { label: 'Add profile photo', done: false },
                { label: 'Upload your CV', done: true },
                { label: 'Add portfolio links', done: true },
                { label: 'Complete bio', done: false },
              ].map(item => (
                <div key={item.label} className='flex items-center gap-2.5'>
                  <CheckCircle className={`w-4 h-4 shrink-0 ${item.done ? 'text-green-400' : 'text-slate-600'}`} />
                  <span className={`text-xs ${item.done ? 'text-slate-400 line-through' : 'text-slate-300'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Earnings mini chart */}
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-1'>
              <h2 className='text-base font-semibold text-white'>Earnings</h2>
              <TrendingUp className='w-4 h-4 text-green-400' />
            </div>
            <p className='text-2xl font-bold text-white mb-0.5'>$1,240</p>
            <p className='text-xs text-green-400 mb-4'>↑ 24% vs last month</p>
            {/* Mini bar chart */}
            <div className='flex items-end gap-1.5 h-14'>
              {[30, 55, 40, 70, 50, 85, 65].map((h, i) => (
                <div key={i} className='flex-1 rounded-t-sm bg-blue-500/20 hover:bg-blue-500/40 transition-colors relative'>
                  <div className='absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm transition-all' style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className='flex justify-between mt-1'>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className='flex-1 text-center text-xs text-slate-600'>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended Projects ── */}
      <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5'>
        <div className='flex items-center justify-between mb-5'>
          <div>
            <h2 className='text-base font-semibold text-white'>Recommended for You</h2>
            <p className='text-xs text-slate-500 mt-0.5'>Based on your skills and past applications</p>
          </div>
          <button onClick={() => navigate('browse-projects')} className='flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors'>
            Browse all <ArrowRight className='w-3 h-3' />
          </button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {fetchingRecommendations ? (
            <div className='col-span-3 text-center text-slate-500'>Fetching recommended projects...</div>
          ) : recommendedProjects.length === 0 ? (
            <div className='col-span-3 text-center text-slate-500'>No recommendations found. Add your bio and skills to improve suggestions.</div>
          ) : (
            recommendedProjects.map(proj => (
              <div key={proj.project.title} className='bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 hover:bg-slate-800 transition-all cursor-pointer group'>
                <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 mb-3 inline-block'>
                  {proj.project.category || 'Recommended'}
                </span>
                <h3 className='text-sm font-medium text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug'>{proj.project.title}</h3>
                <p className='text-xs text-slate-400 mb-3 line-clamp-2'>{proj.project.description}</p>
                <div className='flex flex-wrap gap-1.5 mb-3'>
                  {(proj.project.technologies || []).map(s => (
                    <span key={s} className='text-xs px-2 py-0.5 bg-slate-700/60 text-slate-400 rounded-md'>{s}</span>
                  ))}
                </div>
                <div className='flex items-center justify-between pt-3 border-t border-slate-700/50'>
                  <span className='text-sm font-bold text-blue-400'>{proj.project.budget}</span>
                  <button className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors'>
                    Apply <ArrowRight className='w-3 h-3' />
                  </button>
                </div>
              </div>
            )))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard