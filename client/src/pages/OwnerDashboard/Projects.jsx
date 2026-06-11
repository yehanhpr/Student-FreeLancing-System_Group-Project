import React, { useContext, useEffect, useState } from 'react'
import {
  Briefcase, CheckCircle, Clock, DollarSign,
  Edit, Eye, Trash2, Users, ArrowRight,
  ArrowLeft, X, AlertTriangle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

// ── Inline StatusBadge ────────────────────────────────────────────────────────
const statusConfig = {
  'open': { label: 'Open', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'has applicants': { label: 'Has Applicants', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'nda_sent': { label: 'NDA Sent', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'accepted': { label: 'NDA Accepted', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'in progress': { label: 'In Progress', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'submitted': { label: 'Submitted', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'completed': { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
}

// ── Dot colour per status ─────────────────────────────────────────────────────
const dotColor = {
  'open': 'bg-slate-400',
  'has applicants': 'bg-blue-400',
  'nda_sent': 'bg-yellow-400',
  'accepted': 'bg-indigo-400',
  'in progress': 'bg-cyan-400',
  'submitted': 'bg-purple-400',
  'completed': 'bg-green-400',
}

// ── Category colour ───────────────────────────────────────────────────────────
const catColor = {
  'Web Development': 'bg-blue-500/10 text-blue-400',
  'UI/UX Design': 'bg-purple-500/10 text-purple-400',
  'Content Writing': 'bg-orange-500/10 text-orange-400',
  'Data Analysis': 'bg-yellow-500/10 text-yellow-400',
  'Marketing': 'bg-pink-500/10 text-pink-400',
}


const statusFilters = [
  { value: 'all', label: 'All Projects' },
  { value: 'open', label: 'Open' },
  { value: 'has applicants', label: 'Has Applicants' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'completed', label: 'Completed' },
]

const ProjectCardSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0 mt-0.5" />
        <div className="w-full max-w-md">
          <div className="h-4 bg-slate-800 rounded w-3/4 mb-2" />
          <div className="h-5 bg-slate-800 rounded-full w-24" />
        </div>
      </div>
      <div className="h-6 w-20 bg-slate-800 rounded-full" />
    </div>

    <div className="flex flex-wrap items-center gap-4 mb-3 ml-12">
      <div className="h-3 w-24 bg-slate-800 rounded" />
      <div className="h-3 w-28 bg-slate-800 rounded" />
      <div className="h-3 w-32 bg-slate-800 rounded" />
      <div className="h-3 w-24 bg-slate-800 rounded" />
    </div>

    <div className="border-t border-slate-800 pt-4 flex items-center gap-2 ml-12">
      <div className="h-9 w-20 bg-slate-800 rounded-xl" />
      <div className="h-9 w-28 bg-slate-800 rounded-xl" />
      <div className="h-9 w-20 bg-slate-800 rounded-xl" />
      <div className="h-9 w-20 bg-slate-800 rounded-xl ml-auto" />
    </div>
  </div>
)

const DeleteProjectModal = ({ project, onClose, onDelete, isDeleting }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-1">Warning</p>
            <h2 className="text-xl font-bold text-white">Delete Project</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-white mb-1">{project?.title}</p>
          <span className="text-xs text-slate-400">This will permanently delete the project and all associated applications.</span>
        </div>

        <div className="flex gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">This action cannot be undone. Are you sure you want to proceed?</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onDelete} disabled={isDeleting} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors cursor-pointer ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Trash2 className="w-4 h-4" /> {isDeleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Projects = () => {
  const { token, user } = useContext(AppContext);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()
  const [projectFilter, setProjectFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/delete-project/${projectToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || 'Project deleted successfully');
        setProjects(prev => prev.filter(p => p._id !== projectToDelete._id));
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } else {
        toast.error(data.message || 'Error deleting project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchProjectsById = async () => {

    if (!token) return;

    try {

      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/projects/${user?._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error('Error fetching project by ID:', data.message);
        return;
      }

      setProjects(data.projects);

    } catch (error) {
      console.error('Error fetching project by ID:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token && user) {
      fetchProjectsById();
    }
  }, [token, user]);

  const filteredProjects = projectFilter === 'all'
    ? projects
    : projects.filter(p => p.status === projectFilter)

  const isUserLoading = Boolean(token) && !user;
  const isPageLoading = isUserLoading || loading;

  const fmt = d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })

  const projectsPerPage = 5;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage);

  const goPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-6">
        {isPageLoading ? (
          <div className="animate-pulse">
            <div className="h-3 w-16 bg-slate-800 rounded mb-2" />
            <div className="h-8 w-56 bg-slate-800 rounded mb-2" />
            <div className="h-4 w-80 bg-slate-800 rounded" />
          </div>
        ) : (
          <>
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Owner</p>
            <h1 className="text-3xl font-bold text-white mb-1">Manage Projects</h1>
            <p className="text-slate-500 text-sm">View, edit, and manage all your posted projects.</p>
          </>
        )}
      </div>

      {/* ── Filter tabs ── */}
      {isPageLoading ? (
        <div className="flex flex-wrap gap-2 mb-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-9 w-28 rounded-xl bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map(f => {
            const count = f.value === 'all' ? projects.length : projects.filter(p => p.status === f.value).length
            const active = projectFilter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setProjectFilter(f.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border cursor-pointer ${active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-900 text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600'
                  }`}
              >
                {f.value !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor[f.value] || 'bg-slate-400'}`} />
                )}
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Project list ── */}
      <div className="flex flex-col gap-4">
        {isPageLoading ? (
          Array.from({ length: 5 }).map((_, idx) => <ProjectCardSkeleton key={idx} />)
        ) : (
          currentProjects.map(project => (
            <div
              key={project._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${catColor[project.category] || 'bg-slate-700 text-slate-400'}`}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
                      {project.title}
                    </h2>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block ${catColor[project.category] || 'bg-slate-700 text-slate-400'}`}>
                      {project.category}
                    </span>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mb-3 ml-12">
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-semibold">${project.budget.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="w-3 h-3" />
                  {project.applicationsCount} applicants
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Due: {fmt(project.deadline)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  Posted: {fmt(project.createdAt)}
                </span>
              </div>

              {/* Assigned / submitted info */}
              {project.assignedTo && (
                <p className="text-xs text-slate-500 mb-3 ml-12">
                  Assigned to: <span className="text-blue-400 font-medium">{project.assignedTo}</span>
                  {project.submittedDate && (
                    <span className="ml-2 text-purple-400">· Submitted {fmt(project.submittedDate)}</span>
                  )}
                </p>
              )}

              {/* Divider + actions */}
              <div className="border-t border-slate-800 pt-4 flex items-center gap-2 ml-12">
                <button onClick={() => navigate(`/apply-project/${project._id}`)} className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700/50 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 transition-all cursor-pointer">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>

                {project.status !== 'submitted' ? (
                  <>
                    <button onClick={() => navigate(`/owner-dashboard/all-applicants/${project._id}`)} className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/20 px-3 py-2 rounded-xl hover:bg-blue-500/10 transition-all cursor-pointer">
                      <Users className="w-3.5 h-3.5" /> Applicants ({project.applicationsCount})
                    </button>
                    <button onClick={() => navigate(`/owner-dashboard/create-project/${project._id}`)} className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700/50 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 transition-all cursor-pointer">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate(`/owner-dashboard/review-submission/${project.assignedTo}`)}
                    className="flex items-center gap-1.5 text-xs text-white bg-purple-600/80 hover:bg-purple-600 border border-purple-500/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Review Work
                  </button>
                )}

                <button 
                  onClick={() => { setProjectToDelete(project); setShowDeleteModal(true); }}
                  className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/20 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Empty state */}
        {!isPageLoading && filteredProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">No projects found</h3>
            <p className="text-slate-500 text-sm mb-5">There are no projects with this status.</p>
            <button
              onClick={() => setProjectFilter('all')}
              className="flex items-center gap-2 text-sm text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-xl hover:bg-blue-500/10 transition-colors"
            >
              View all projects <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!isPageLoading && totalPages > 0 && (
        <div className='mt-6'>
          <div className='flex items-center justify-center mt-4 gap-1 col-span-3 col-start-2'>
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${currentPage === 1 && 'opacity-40 cursor-not-allowed'}`}>
              <ArrowLeft className='w-4 h-4' />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`border text-primary w-8 h-8 rounded cursor-pointer ${currentPage === page && 'bg-primary border-primary text-white'}`}>
                {page}
              </button>
            ))}
            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className={`border text-primary w-8 h-8 rounded flex items-center justify-center cursor-pointer ${currentPage === totalPages && 'opacity-40 cursor-not-allowed'}`}>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteProjectModal 
          project={projectToDelete} 
          onClose={() => { setShowDeleteModal(false); setProjectToDelete(null); }} 
          onDelete={handleDeleteProject} 
          isDeleting={isDeleting} 
        />
      )}
    </div>
  )
}

export default Projects