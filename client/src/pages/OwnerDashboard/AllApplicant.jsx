import {
  CheckCircle, Clock, Eye, File, FileText,
  Send, Star, UploadIcon, UserCheck, X,
  DollarSign, Briefcase, Users, AlertTriangle
} from 'lucide-react'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { useContext } from 'react'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

// ── Inline StatusBadge ────────────────────────────────────────────────────────
const statusConfig = {
  'applied': { label: 'Under Review', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'not-sent': { label: 'NDA Not Sent', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'pending': { label: 'NDA Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'nda_sent': { label: 'NDA Sent', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'accepted': { label: 'NDA Accepted', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'rejected': { label: 'NDA Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'assigned': { label: 'Assigned', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
}
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
}


// ── timeAgo (unchanged logic) ─────────────────────────────────────────────────
const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  let diffMs = now - date
  if (diffMs < 0) return 'Just now'
  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  return `${years} year${years > 1 ? 's' : ''} ago`
}

// ── Modal backdrop ────────────────────────────────────────────────────────────
const Backdrop = ({ onClick }) => (
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClick} />
)

// ── Main Component ────────────────────────────────────────────────────────────
const AllApplicant = () => {
  const navigate = useNavigate()

  const { user, token, projects, allApplicants, fetchApplicants } = useContext(AppContext);

  const [showNDAModel, setShowNDAModel] = useState(false)
  const [showAssignProjectModel, setShowAssignProjectModel] = useState(false)
  const [showSendNDAModel, setShowSendNDAModel] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const inputRef = useRef(null)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('File too large'); return }
    setFile(f)
  }
  const handleRemove = () => { setFile(null); if (inputRef.current) inputRef.current.value = '' }

  const closeAllModals = () => {
    setShowNDAModel(false)
    setShowAssignProjectModel(false)
    setShowSendNDAModel(false)
  }

  const recruiterProjects = projects.filter(project =>
    allApplicants.some(applicant => applicant.projectId._id === project._id)
  );

  const handleSendNDA = async () => {
    setLoading(true);
    try {
      if (!token) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      if (!selectedApplicant?._id) {
        toast.error('Please select an applicant to send NDA');
        return;
      }

      const formData = new FormData();
      formData.append('applicationId', selectedApplicant._id);
      formData.append('ndaDocument', file);

      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/send-nda`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to send NDA');
        return;
      }

      toast.success('NDA sent successfully');

    } catch (error) {
      toast.error('Failed to send NDA');
      console.error('Error sending NDA:', error);
    } finally {
      setLoading(false);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      closeAllModals();
    }
  }


  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Applicants</p>
        <h1 className="text-3xl font-bold text-white mb-1">All Project Applicants</h1>
        <p className="text-slate-500 text-sm">Viewing applicants across all projects</p>
      </div>

      {/* ── Projects + applicants ── */}
      <div className="flex flex-col gap-5">
        {recruiterProjects && recruiterProjects.map(project => {
          const projectApplicants = allApplicants.filter(a => a.projectId._id === project._id)

          return (
            <div key={project._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              {/* Project header */}
              <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white mb-1">{project.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-green-400 font-medium">
                        <DollarSign className="w-3 h-3" />${project.budget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{new Date(project.deadline).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />{projectApplicants.length} applicants
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`${project._id}`)}
                  className="text-xs text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {/* Applicant cards grid */}
              <div className="grid grid-cols-2 gap-3">
                {projectApplicants.slice(0, 4).map(applicant => {
                  const student = applicant.studentId || {};
                  return (
                    <div key={applicant._id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all group flex flex-col h-full">

                      {/* Top: avatar + name */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {student.profilePicture ? (
                            <img src={student.profilePicture} alt={student.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name?.slice(0, 2).toUpperCase() || 'NA'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{student.name || 'Unknown Student'}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{student.university || 'University not provided'}</p>
                            <p className="text-xs text-slate-600 line-clamp-1">{student.major || 'Major not provided'}</p>
                          </div>
                        </div>
                        {/* Status Badge */}
                        <div className="shrink-0">
                          <StatusBadge status={applicant.status} />
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
                        {student.skills && student.skills.length > 0 ? (
                          <>
                            {student.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-300 border border-slate-600/50 rounded-md">
                                {skill}
                              </span>
                            ))}
                            {student.skills.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-slate-700/60 text-slate-500 rounded-md">
                                +{student.skills.length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No skills listed</span>
                        )}
                      </div>

                      {/* Bio / Notes preview & Time */}
                      <div className="flex items-end justify-between mb-4 flex-1">
                        <div className="pr-4">
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {applicant.notes || student.bio || 'No additional information provided.'}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {timeAgo(applicant.createdAt)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50 mt-auto">
                        <button
                          onClick={() => navigate(`/owner-dashboard/view-details?studentId=${student._id}&projectId=${project._id}`)}
                          className="flex items-center justify-center gap-1.5 text-xs text-blue-400 border border-blue-500/20 px-2 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all cursor-pointer flex-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>

                        {applicant.status === 'nda_sent' ? (
                          <button className="flex items-center justify-center gap-1 text-xs text-yellow-400 border border-yellow-500/20 px-2 py-1.5 rounded-lg cursor-not-allowed opacity-60 flex-1 whitespace-nowrap">
                            <Clock className="w-3 h-3" /> NDA Sent
                          </button>
                        ) : applicant.status === 'accepted' ? (
                          <button className="flex items-center justify-center gap-1 text-xs text-green-400 border border-green-500/20 px-2 py-1.5 rounded-lg cursor-default flex-1 whitespace-nowrap">
                            <CheckCircle className="w-3 h-3" /> Signed
                          </button>
                        ) : (
                          <button
                            onClick={() => { closeAllModals(); setSelectedApplicant(applicant); setShowSendNDAModel(true) }}
                            className="flex items-center justify-center gap-1 text-xs text-slate-300 border border-slate-600 px-2 py-1.5 rounded-lg hover:text-white hover:border-slate-500 transition-all cursor-pointer flex-1 whitespace-nowrap"
                          >
                            <Send className="w-3 h-3" /> Send NDA
                          </button>
                        )}

                        <button
                          disabled={applicant.status !== 'selected'}
                          onClick={() => { closeAllModals(); setSelectedApplicant(applicant); setSelectedProject(project); setShowAssignProjectModel(true) }}
                          className={`flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-lg border transition-all flex-1
                            ${applicant.status === 'selected'
                              ? 'text-green-400 border-green-500/30 hover:bg-green-500/10 cursor-pointer'
                              : 'text-slate-600 border-slate-700/50 cursor-not-allowed'
                            }`}
                        >
                          <UserCheck className="w-3 h-3" /> {applicant.status === 'assigned' ? 'Assigned' : applicant.status}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── NDA Review Modal ── */}
      {showNDAModel && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Backdrop onClick={() => setShowNDAModel(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Review</p>
                <h2 className="text-xl font-bold text-white">NDA Response</h2>
              </div>
              <button onClick={() => setShowNDAModel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-5">
              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">NDA Accepted</p>
                <p className="text-xs text-slate-500 mt-0.5">Accepted {timeAgo(selectedApplicant?.ndaId?.createdAt || selectedApplicant.updatedAt)}</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">NDA Document</p>
            <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Signed NDA Agreement</p>
                  <p className="text-xs text-slate-500">PDF · 1.2 MB</p>
                </div>
              </div>
              <button className="text-xs text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer">
                Download
              </button>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Applicant Information</p>
              <div className="flex items-center gap-3 mb-2">
                {selectedApplicant.studentId.profilePicture ? (
                  <img src={selectedApplicant.studentId.profilePicture} alt={selectedApplicant.studentId.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {selectedApplicant.studentId.name?.slice(0, 2).toUpperCase() || 'NA'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{selectedApplicant.studentId.name}</p>
                  <p className="text-xs text-slate-500">{selectedApplicant.studentId.university}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowNDAModel(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
                Close
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer">
                <UserCheck className="w-4 h-4" /> Assign Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Project Modal ── */}
      {showAssignProjectModel && selectedApplicant && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Backdrop onClick={() => setShowAssignProjectModel(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Action</p>
                <h2 className="text-xl font-bold text-white">Assign Project</h2>
              </div>
              <button onClick={() => setShowAssignProjectModel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Assigning to */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 mb-2">Assigning to</p>
              <div className="flex items-center gap-3">
                {selectedApplicant.studentId.profilePicture ? (
                  <img src={selectedApplicant.studentId.profilePicture} alt={selectedApplicant.studentId.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedApplicant.studentId.name?.slice(0, 2).toUpperCase() || 'NA'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{selectedApplicant.studentId.name}</p>
                  <p className="text-xs text-slate-500">{selectedApplicant.studentId.university}</p>
                </div>
              </div>
            </div>

            {/* NDA status */}
            <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">NDA Accepted</p>
                <p className="text-xs text-slate-500">The student has reviewed and accepted the NDA agreement.</p>
              </div>
            </div>

            {/* Project details */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Project Details</p>
              <p className="text-sm font-medium text-white mb-1">{selectedProject.title}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-green-400 font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" />${selectedProject.budget}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{selectedProject.deadline}</span>
              </div>
            </div>

            {/* Warning */}
            <div className="flex gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">Once assigned, the student will be notified and can start working. Other applicants will be automatically rejected.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAssignProjectModel(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
                Cancel
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer">
                <UserCheck className="w-4 h-4" /> Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send NDA Modal ── */}
      {showSendNDAModel && selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <Backdrop onClick={() => setShowSendNDAModel(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">NDA</p>
                <h2 className="text-xl font-bold text-white">Send NDA</h2>
              </div>
              <button onClick={() => setShowSendNDAModel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sending to */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-5">
              <p className="text-xs text-slate-500 mb-2">Sending NDA to</p>
              <div className="flex items-center gap-3">
                {selectedApplicant.studentId.profilePicture ? (
                  <img src={selectedApplicant.studentId.profilePicture} alt={selectedApplicant.studentId.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedApplicant.studentId.name?.slice(0, 2).toUpperCase() || 'NA'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{selectedApplicant.studentId.name}</p>
                  <p className="text-xs text-slate-500">{selectedApplicant.studentId.university}</p>
                </div>
              </div>
            </div>

            {/* File upload */}
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Upload NDA Document</p>
            {!file ? (
              <div
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-600 rounded-xl py-8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer mb-5"
              >
                <UploadIcon className="w-8 h-8 text-slate-600" />
                <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-600">.pdf (max 5MB)</p>
                <input type="file" ref={inputRef} accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                    <File className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={handleRemove} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Warning */}
            <div className="flex gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">The applicant will need to review and accept the NDA before proceeding with the project.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowSendNDAModel(false)} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSendNDA} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                <Send className="w-4 h-4" />{loading ? 'Sending...' : 'Send NDA'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AllApplicant