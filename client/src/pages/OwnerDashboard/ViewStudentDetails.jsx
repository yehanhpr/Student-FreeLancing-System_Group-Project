import {
  ArrowLeft, Award, Briefcase, Clock, ExternalLink,
  Eye, FileText, GraduationCap, Mail, MapPin,
  Phone, Star, UserCheck, X, DollarSign,
  Shield, UserIcon, Send, CheckCircle, Download, AlertTriangle
} from 'lucide-react'
import React, { useRef } from 'react'
import heroImg2 from '../../assets/heroImg2.jpg'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { useContext } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

// ── Inline StatusBadge ────────────────────────────────────────────────────────
const statusConfig = {
  'applied': { label: 'Under Review', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  'nda_sent': { label: 'NDA Sent', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'accepted': { label: 'NDA Accepted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'in progress': { label: 'In Progress', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  'completed': { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  const options = { year: 'numeric', month: 'short' };
  return date.toLocaleDateString(undefined, options);
}

// ── NDA Modal ─────────────────────────────────────────────────────────────────
const NDAModal = ({ applicant, onClose }) => {
  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const downloadNdaFile = async () => {
    const url = applicant.ndaDocumentUrl;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${applicant.project || 'nda-document'}.${applicant.ndaDocumentUrl.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Non-Disclosure Agreement</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-start justify-between bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-1">Project</p>
              <h3 className="text-white font-semibold text-sm mb-2">{applicant.project || 'Untitled Project'}</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-slate-300 text-xs">{applicant.name || 'Unknown Student'}</span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-slate-500 text-xs">{applicant.email || 'No email provided'}</span>
              </div>
            </div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-xs text-slate-400 leading-relaxed space-y-4">
            <h4 className="text-slate-200 text-sm font-semibold">Non-Disclosure Agreement</h4>
            <p>This Non-Disclosure Agreement ("Agreement") is entered into as of the date of electronic acceptance by and between TechStart Inc. ("Disclosing Party") and {applicant.name || 'the Receiving Party'} ("Receiving Party").</p>
            {[
              ['1. Definition of Confidential Information', 'For purposes of this Agreement, "Confidential Information" shall include all information or material that has or could have commercial value or other utility in the business in which Disclosing Party is engaged. This includes, but is not limited to, technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information.'],
              ['2. Obligations of Receiving Party', 'Receiving Party agrees to hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. Receiving Party shall carefully restrict access to Confidential Information to employees, contractors, and third parties as is reasonably required and shall require those persons to sign nondisclosure restrictions at least as protective as those in this Agreement.'],
              ['3. Term', 'This Agreement shall remain in effect for a period of 2 years from the date of acceptance, unless otherwise terminated in writing by both parties. The obligations of confidentiality shall survive termination of this Agreement.'],
              ['4. Return of Materials', 'Upon completion of the project or upon request by Disclosing Party, all documents and materials containing Confidential Information shall be returned to Disclosing Party or destroyed with written certification of destruction.'],
              ['5. Remedies', 'The parties acknowledge that monetary damages may not be a sufficient remedy for unauthorized disclosure of Confidential Information and that Disclosing Party shall be entitled, without waiving any other rights or remedies, to such injunctive or equitable relief as may be deemed proper by a court of competent jurisdiction.'],
            ].map(([title, body]) => (
              <div key={title}>
                <p className="text-slate-300 font-medium mb-1">{title}</p>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Send className="w-3 h-3" /> Applied date
              </div>
              <p className="text-slate-200 text-xs font-medium">{applicant.appliedDate || '—'}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <CheckCircle className="w-3 h-3" /> Accepted date
              </div>
              <p className={`text-xs font-medium ${applicant.ndaAcceptedDate ? 'text-green-400' : 'text-slate-600'}`}>
                {fmt(applicant.ndaAcceptedDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all cursor-pointer">
            Close
          </button>
          <button onClick={downloadNdaFile} disabled={!applicant.ndaDocumentUrl} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer">
            <Download className="w-3.5 h-3.5" /> Download Signed NDA
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Assign Project Modal ──
const AssignProjectModal = ({ applicant, onClose, onAssign, assigning }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">Action</p>
            <h2 className="text-xl font-bold text-white">Assign Project</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-2">Assigning to</p>
          <div className="flex items-center gap-3">
            {applicant.profilePhoto ? (
              <img src={applicant.profilePhoto} alt={applicant.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {applicant.name?.slice(0, 2).toUpperCase() || 'NA'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">{applicant.name}</p>
              <p className="text-xs text-slate-500">{applicant.university}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3 mb-4">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">NDA Accepted</p>
            <p className="text-xs text-slate-500">The student has reviewed and accepted the NDA agreement.</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Project Details</p>
          <p className="text-sm font-medium text-white mb-1">{applicant.project}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-green-400 font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" />${applicant.projectBudget}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{applicant.projectDeadline ? formatDate(applicant.projectDeadline) : '—'}</span>
          </div>
        </div>

        <div className="flex gap-2 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">Once assigned, the student will be notified and can start working. Other applicants will be automatically rejected.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={assigning} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
            Cancel
          </button>
          <button onClick={onAssign} disabled={assigning} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer ${assigning ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <UserCheck className="w-4 h-4" /> {assigning ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ViewStudentDetails = () => {

  const { token, user, role } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');
  const projectId = searchParams.get('projectId');

  const navigate = useNavigate()

  // ── Modals & Actions ────────────────────────────────────────────────────────
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const handleAssignProject = async () => {
    setAssigning(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/assign-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId: studentId, projectId: projectId })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to assign project:', data.message);
        toast.error(data.message);
        return;
      }

      toast.success(data.message);
      setShowAssignModal(false);
      fetchStudentProfile(); // Refresh profile after assigning
    } catch (error) {
      console.error('Error assigning project:', error);
      toast.error('Error assigning project');
    } finally {
      setAssigning(false);
    }
  };

  // ── Drag scroll refs (unchanged logic) ──
  const feedbackRef = useRef(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - feedbackRef.current.offsetLeft;
    scrollLeft.current = feedbackRef.current.scrollLeft
  }
  const onMouseLeave = () => { isDragging.current = false }
  const onMouseUp = () => { isDragging.current = false }
  const onMouseMove = (e) => {
    if (!isDragging.current) return
    e.preventDefault()
const x = e.pageX - feedbackRef.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    feedbackRef.current.scrollLeft = scrollLeft.current - walk
  }

  // ── Applicant data ─────────────────────────────────────────────────────────────────────────────────────
  const [applicant, setApplicant] = useState({});
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  const statCards = [
    { icon: Briefcase, label: 'Projects Completed', value: applicant.completedProjects || 0, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
    { icon: Award, label: 'Member Since', value: applicant.memberSince || 'N/A', color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
    { icon: Clock, label: 'Applied', value: applicant.appliedDate || 'N/A', color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
  ]
  if (applicant.rating) {
    statCards.push({ icon: Star, label: 'Rating', value: applicant.rating, color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' });
  }

  const linkItems = [
    { href: applicant.portfolio, label: 'Portfolio', icon: Briefcase },
    { href: applicant.linkedin, label: 'LinkedIn', icon: ExternalLink },
    { href: applicant.github, label: 'GitHub', icon: ExternalLink },
  ]



  const fetchStudentProfile = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/applicant-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, projectId })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error fetching student profile:', data.message || 'Failed to fetch student profile');
        return;
      }

      setApplicant({
        id: data?.applicantDetails.studentId._id,
        name: data?.applicantDetails.studentId.name,
        email: data?.applicantDetails.studentId.email,
        phone: data?.applicantDetails.studentId.phone,
        profilePhoto: data?.applicantDetails.studentId.profilePicture,
        projectId: data?.applicantDetails.projectId._id,
        university: data?.applicantDetails.studentId.university,
        degree: data?.applicantDetails.studentId.major,
        location: data?.applicantDetails.studentId.location,
        rating: data?.applicantDetails.studentId.rating,
        completedProjects: data?.applicantDetails.studentId.completedProjects,
        totalEarnings: data?.applicantDetails.studentId.totalEarnings,
        responseRate: data?.applicantDetails.studentId.responseRate,
        memberSince: data?.applicantDetails.studentId.createdAt ? formatDate(data?.applicantDetails.studentId.createdAt) : '',
        appliedDate: data?.applicantDetails.createdAt ? formatDate(data?.applicantDetails.createdAt) : '',
        skills: data?.applicantDetails.studentId.skills || [],
        bio: data?.applicantDetails.studentId.bio || data?.applicantDetails.notes || 'No bio provided.',
        projectPlan: data?.applicantDetails.projectPlanUrl,
        cv: data?.applicantDetails.cvUrl || data?.applicantDetails.studentId.resume,
        status: data?.applicantDetails.status,
        ndaDocumentUrl: data?.applicantDetails.ndaId?.documentUrl,
        ndaStatus: data?.applicantDetails.ndaId?.ndaStatus,
        ndaAcceptedDate: data?.applicantDetails.ndaId?.updatedAt,
        portfolio: data?.applicantDetails.studentId.portfolio,
        linkedin: data?.applicantDetails.studentId.linkedin,
        github: data?.applicantDetails.studentId.github,
        project: data?.applicantDetails.projectId.title,
        projectBudget: data?.applicantDetails.projectId.budget,
        projectDeadline: data?.applicantDetails.projectId.deadline,
        feedbacks: []
      })

    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  }, [token, studentId, projectId])

  const getAllFeedbacks = useCallback(async (sid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/student-reviews/${sid}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        console.error('Error fetching reviews:', data.message);
        return;
      }
      setReviews(data.reviews || []);
      setAvgRating(data.averageRating || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [token])


  useEffect(() => {
    if (token && studentId && projectId) {
      fetchStudentProfile();
    }
  }, [fetchStudentProfile]);

  // Fetch reviews separately once studentId is known
  useEffect(() => {
    if (token && studentId) {
      getAllFeedbacks(studentId);
    }
  }, [getAllFeedbacks, studentId]);


  return (
    <div className="min-h-screen">

      {/* ── Back nav ── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to applicants
      </button>

      {/* ── Profile card ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-5">

        {/* Top: avatar + name */}
        <div className="flex items-start gap-5 mb-6">
          {applicant.profilePhoto
            ? <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 shrink-0">
              <img src={applicant.profilePhoto} alt="profile" className="w-full h-full object-cover object-center" />
            </div>
            : <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {applicant.name?.slice(0, 2).toUpperCase() || 'NA'}
            </div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{applicant.name}</h1>
              <StatusBadge status={applicant.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-1.5">
              {applicant.university && <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-blue-400" />{applicant.university}</span>}
              {applicant.degree && <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-blue-400" />{applicant.degree}</span>}
              {applicant.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" />{applicant.location}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {applicant.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{applicant.email}</span>}
              {applicant.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{applicant.phone}</span>}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {statCards.map(({ icon: Icon, label, value, color, border }) => (
            <div key={label} className={`bg-slate-800/60 border ${border} rounded-xl px-4 py-3.5 flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
          <StatusBadge status={applicant.status} />
          <div className="flex items-center gap-2">
            {applicant.status === 'rejected' ? (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                <X className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">Application Rejected</span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowNDAModal(true)}
                  disabled={applicant.ndaStatus !== 'accepted'}
                  className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <Eye className="w-3.5 h-3.5" /> View NDA
                </button>
                {applicant.status !== 'assigned' && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={applicant.ndaStatus !== 'accepted'}
                    className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/30 px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Assign Project
                  </button>
                )}
                {applicant.status !== 'assigned' && (
                  <button className="flex items-center gap-1.5 text-xs text-red-400 border border-red-500/20 px-4 py-2 rounded-xl hover:bg-red-500/10 transition-all cursor-pointer">
                    <X className="w-3.5 h-3.5" /> Reject Application
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showNDAModal && <NDAModal applicant={applicant} onClose={() => setShowNDAModal(false)} />}
      {showAssignModal && <AssignProjectModal applicant={applicant} onClose={() => setShowAssignModal(false)} onAssign={handleAssignProject} assigning={assigning} />}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-3 gap-5 items-start">

        {/* ── Left col (2/3) ── */}
        <div className="col-span-2 space-y-5">

          {/* Applied for */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl shrink-0">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Applied for</p>
              <h2 className="text-lg font-semibold text-white mb-3">{applicant.project || 'Project Title'}</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="text-sm font-bold text-green-400 mt-0.5">${applicant.projectBudget || '800'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Deadline</p>
                  <p className="text-sm font-bold text-blue-400 mt-0.5">{formatDate(applicant.projectDeadline) || '2 weeks'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* About + Skills + Feedbacks */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-7">

            {/* About */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">About</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{applicant.bio}</p>
            </div>

            <div className="border-t border-slate-800" />

            {/* Skills */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Skills & Expertise</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {applicant.skills && applicant.skills.length > 0 ? (
                  applicant.skills.map((skill, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No skills listed</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800" />

            {/* Client Feedbacks */}
            {reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center rounded-xl">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Client Feedbacks</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3 h-3 ${n <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                      ))}
                      <span className="text-xs text-yellow-400 font-semibold ml-1">{avgRating} avg</span>
                      <span className="text-xs text-slate-500 ml-1">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Drag scroll carousel */}
                <ul
                  ref={feedbackRef}
                  className="flex gap-4 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none scrollbar-none"
                  style={{ scrollbarWidth: 'none' }}
                  onMouseDown={onMouseDown}
                  onMouseLeave={onMouseLeave}
                  onMouseUp={onMouseUp}
                  onMouseMove={onMouseMove}
                >
                  {reviews.map((fb) => (
                    <li key={fb.id} className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl min-w-[370px] max-w-[400px] shrink-0">
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {fb.companyLogo ? (
                            <img src={fb.companyLogo} alt={fb.clientName} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl text-xs font-bold shrink-0">
                              {fb.clientName?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white leading-snug">{fb.clientName}</p>
                            <p className="text-xs text-slate-500">{fb.companyName}</p>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full shrink-0">
                          <Star className="w-3 h-3 fill-current" />{fb.rating}
                        </span>
                      </div>

                      {/* Star row */}
                      <div className="flex items-center gap-0.5 mb-3">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3.5 h-3.5 ${n <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                        ))}
                      </div>

                      {/* Comment */}
                      {fb.comment ? (
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">{fb.comment}</p>
                      ) : (
                        <p className="text-xs text-slate-600 italic mb-4">No comment provided.</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-5 pt-3 border-t border-slate-700/50">
                        <div>
                          <p className="text-xs font-semibold text-white">{fb.date}</p>
                          <p className="text-xs text-slate-600">Date</p>
                        </div>
                        {fb.budget && (
                          <>
                            <div className="w-px h-6 bg-slate-700" />
                            <div>
                              <p className="text-xs font-semibold text-green-400">${fb.budget.toLocaleString()}</p>
                              <p className="text-xs text-slate-600">Budget</p>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Scroll nav */}
                {reviews.length > 1 && (
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => feedbackRef.current.scrollBy({ left: -360, behavior: 'smooth' })}
                      className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer px-3 py-1.5 border border-slate-700 rounded-lg hover:border-blue-500/30"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => feedbackRef.current.scrollBy({ left: 360, behavior: 'smooth' })}
                      className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer px-3 py-1.5 border border-slate-700 rounded-lg hover:border-blue-500/30"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right col (1/3) ── */}
        <div className="col-span-1 space-y-4">

          {/* Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Documents</h2>
            </div>

            {applicant.cv && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">CV / Resume</p>
                    <p className="text-xs text-slate-500">Document</p>
                  </div>
                </div>
                <a
                  href={applicant.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  View / Download
                </a>
              </div>
            )}
            {applicant.projectPlan && (
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Project Plan</p>
                    <p className="text-xs text-slate-500">Document</p>
                  </div>
                </div>
                <a
                  href={applicant.projectPlan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer"
                >
                  View / Download
                </a>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Links</h2>
            </div>

            <div className="flex flex-col gap-2">
              {linkItems.filter(l => l.href).map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 px-4 py-3 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-blue-400 transition-colors">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Earnings info */}
          {applicant.totalEarnings !== undefined && applicant.totalEarnings !== null && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-xl">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <h2 className="text-base font-semibold text-white">Earnings</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-white">${(applicant.totalEarnings / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-slate-500 mt-0.5">Total Earned</p>
                </div>
                {applicant.responseRate && (
                  <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-white">{applicant.responseRate}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Response Rate</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ViewStudentDetails