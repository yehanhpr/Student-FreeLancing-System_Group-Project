import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  User,
  DollarSign,
  BadgeCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const statusConfig = {
  applied: { label: 'Under Review', color: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
  nda_sent: { label: 'NDA Sent', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' },
  accepted: { label: 'NDA Accepted', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  'in progress': { label: 'In Progress', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-300 border-green-500/30' }
}

const normalizeDate = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fallbackApplicant = {
  name: 'N/A',
  email: 'N/A',
  university: 'N/A',
  major: 'N/A',
  skills: ['N/A'],
  bio: 'N/A',
  github: '',
  linkedin: '',
  portfolio: '',
  profilePicture: '',
  graduationYear: 'N/A',
  location: 'N/A',
  phone: 'N/A'
}

const fallbackProject = {
  title: 'N/A',
  budget: 'N/A',
  deadline: 'N/A'
}

const mapApplicationData = (application = {}) => {
  const student = application?.studentId || {}
  const project = application?.projectId || {}

  return {
    applicationId: application?._id || 'N/A',
    status: application?.status ? String(application.status).replace(/_/g, '-') : 'applied',
    createdAt: normalizeDate(application?.createdAt),
    updatedAt: normalizeDate(application?.updatedAt),
    notes: application?.notes || 'No notes provided.',
    cvUrl: application?.cvUrl || '',
    projectPlanUrl: application?.projectPlanUrl || '',
    ndaUrl: application?.ndaId?.documentUrl || '',
    applicant: {
      ...fallbackApplicant,
      ...student,
      major: student?.major || 'N/A',
      location: student?.location || 'N/A',
      phone: student?.phone || 'N/A',
      skills: Array.isArray(student?.skills) && student.skills.length ? student.skills : ['N/A']
    },
    project: {
      ...fallbackProject,
      ...project,
      budget: typeof project?.budget === 'number' ? `$${project.budget}` : 'N/A',
      deadline: normalizeDate(project?.deadline)
    }
  }
}

const SkeletonBlock = ({ className = '' }) => <div className={`animate-pulse bg-slate-800/80 rounded-xl ${className}`} />

const ViewStudentDetails2 = () => {
  const navigate = useNavigate()
  const { token, user } = useContext(AppContext)

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const studentId = searchParams.get('studentId')
  const projectId = searchParams.get('projectId')

  const [application, setApplication] = useState(mapApplicationData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApplicantDetails = async () => {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/applicant-details`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId, projectId })
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to fetch applicant details.')
      }

      setApplication(mapApplicationData(data.application))
    } catch (err) {
      setError(err.message || 'Something went wrong while loading details.')
      setApplication(mapApplicationData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (studentId && projectId && token && user) {
      fetchApplicantDetails()
    } else {
      setLoading(false)
      setError('Missing student or project information in URL.')
    }
  }, [studentId, projectId, token, user])

  const status = statusConfig[application.status] || {
    label: application.status || 'N/A',
    color: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
  }

  const links = [
    { label: 'GitHub', value: application.applicant.github },
    { label: 'LinkedIn', value: application.applicant.linkedin },
    { label: 'Portfolio', value: application.applicant.portfolio }
  ]

  return (
    <div className="min-h-screen text-white">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to applicants
      </button>

      {loading ? (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <SkeletonBlock className="w-20 h-20 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-7 w-1/3" />
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-4 w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
              <SkeletonBlock className="h-20" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <SkeletonBlock className="h-6 w-1/4" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-5/6" />
              <SkeletonBlock className="h-4 w-2/3" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <SkeletonBlock className="h-6 w-1/2" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="bg-red-500/10 text-red-300 border border-red-500/30 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-start gap-5">
              {application.applicant.profilePicture ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 shrink-0">
                  <img
                    src={application.applicant.profilePicture}
                    alt="student"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold">
                  {String(application.applicant.name).slice(0, 2).toUpperCase() || 'NA'}
                </div>
              )}

              <div className="flex-1 min-w-60">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{application.applicant.name || 'N/A'}</h1>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${status.color}`}>{status.label}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />{application.applicant.email || 'N/A'}</p>
                  <p className="flex items-center gap-2"><User className="w-4 h-4 text-blue-400" />{application.applicant.major || 'N/A'}</p>
                  <p className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-blue-400" />{application.applicant.university || 'N/A'}</p>
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" />{application.applicant.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400">Applied On</p>
                <p className="text-sm font-semibold mt-1">{application.createdAt}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400">Last Updated</p>
                <p className="text-sm font-semibold mt-1">{application.updatedAt}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-400">Graduation Year</p>
                <p className="text-sm font-semibold mt-1">{application.applicant.graduationYear || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 items-start">
            <div className="col-span-2 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-semibold">Project Applied</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 md:col-span-3">
                    <p className="text-xs text-slate-400">Title</p>
                    <p className="text-sm font-semibold mt-1">{application.project.title || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Budget</p>
                    <p className="text-sm font-semibold mt-1">{application.project.budget}</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Deadline</p>
                    <p className="text-sm font-semibold mt-1 flex items-center gap-1"><Calendar className="w-4 h-4 text-blue-400" />{application.project.deadline}</p>
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Application ID</p>
                    <p className="text-sm font-semibold mt-1 break-all">{application.applicationId}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-semibold">About Candidate</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{application.applicant.bio || 'N/A'}</p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {application.applicant.skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-xl">
                        {skill || 'N/A'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Documents
                </h2>
                <div className="space-y-2">
                  <a
                    href={application.cvUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${application.cvUrl ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/30 text-slate-200' : 'bg-slate-800/40 border-slate-700 text-slate-500 pointer-events-none'}`}
                  >
                    CV / Resume
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={application.projectPlanUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${application.projectPlanUrl ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/30 text-slate-200' : 'bg-slate-800/40 border-slate-700 text-slate-500 pointer-events-none'}`}
                  >
                    Project Plan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={application.ndaUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${application.ndaUrl ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/30 text-slate-200' : 'bg-slate-800/40 border-slate-700 text-slate-500 pointer-events-none'}`}
                  >
                    NDA Document
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-400" /> Links
                </h2>
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.value || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm ${link.value ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500/30 text-slate-200' : 'bg-slate-800/40 border-slate-700 text-slate-500 pointer-events-none'}`}
                    >
                      {link.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-400" /> Notes
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">{application.notes || 'No notes provided.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewStudentDetails2