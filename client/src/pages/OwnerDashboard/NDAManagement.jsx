import {
  CheckCircle, Clock, Download, Eye, FileText,
  Send, UserIcon, X, XCircle, Shield, ArrowRight
} from 'lucide-react';
import React, { useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Inline StatusBadge ────────────────────────────────────────────────────────
const statusConfig = {
  'nda_sent': { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  'accepted': { label: 'Accepted', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'rejected': { label: 'Rejected', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  return (
    <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

// ── Dot colour per status ─────────────────────────────────────────────────────
const dotColor = {
  'nda_sent': 'bg-yellow-400',
  'accepted': 'bg-green-400',
  'rejected': 'bg-red-400',
};

const getNdaUrl = (nda) => nda?.documentUrl || nda?.documentURL || nda?.ndaDocumentUrl || '';

const openNdaInNewTab = (nda) => {
  const ndaUrl = getNdaUrl(nda);
  if (!ndaUrl) return;
  window.open(ndaUrl, '_blank', 'noopener,noreferrer');
};

const downloadNdaFile = async (nda) => {
  const ndaUrl = getNdaUrl(nda);
  if (!ndaUrl) return;

  try {
    const response = await fetch(ndaUrl);
    if (!response.ok) {
      throw new Error('Unable to fetch NDA document');
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const urlPath = ndaUrl.split('?')[0] || '';
    const fileExtension = (urlPath.split('.').pop() || 'pdf').toLowerCase();

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${nda?.applicationId?.projectId?.title || nda?.projectTitle || 'nda-document'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(objectUrl);
  } catch (error) {
    // Fallback for sources that block fetch/CORS for blob downloads.
    openNdaInNewTab(nda);
  }
};


const statusFilters = [
  { value: 'all', label: 'All NDAs' },
  { value: 'nda_sent', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

// ── Stat card accent ──────────────────────────────────────────────────────────
const statAccent = {
  total: { icon: FileText, iconBg: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
  pending: { icon: Clock, iconBg: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' },
  accepted: { icon: CheckCircle, iconBg: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
  rejected: { icon: XCircle, iconBg: 'bg-red-500/10 text-red-400', border: 'border-red-500/20' },
};

// ── NDA Modal ─────────────────────────────────────────────────────────────────
const NDAModal = ({ nda, onClose }) => {
  const fmt = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const student = nda?.applicationId?.studentId;
  const projectTitle = nda?.applicationId?.projectId?.title || 'Untitled Project';
  const acceptedDate = nda?.acceptedDate || nda?.acceptedAt || (nda?.ndaStatus === 'accepted' ? nda?.updatedAt : null);

  const ndaUrl = getNdaUrl(nda);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-2xl z-10 flex flex-col max-h-[90vh]">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-white">Non-Disclosure Agreement</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project + student info bar */}
        <div className="px-6 pt-4">
          <div className="flex items-start justify-between bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-1">Project</p>
              <h3 className="text-white font-semibold text-sm mb-2">{projectTitle}</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center">
                  <UserIcon className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-slate-300 text-xs">{student?.name || 'Unknown Student'}</span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-slate-500 text-xs">{student?.email || 'No email provided'}</span>
              </div>
            </div>
            <StatusBadge status={nda.ndaStatus} />
          </div>
        </div>

        {/* NDA body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-xs text-slate-400 leading-relaxed space-y-4">
            <h4 className="text-slate-200 text-sm font-semibold">Non-Disclosure Agreement</h4>
            <p>This Non-Disclosure Agreement ("Agreement") is entered into as of the date of electronic acceptance by and between TechStart Inc. ("Disclosing Party") and {student?.name || 'the Receiving Party'} ("Receiving Party").</p>
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

        {/* Date grid */}
        <div className="px-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Send className="w-3 h-3" /> Sent date
              </div>
              <p className="text-slate-200 text-xs font-medium">{fmt(nda.createdAt)}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <CheckCircle className="w-3 h-3" /> Accepted date
              </div>
              <p className={`text-xs font-medium ${acceptedDate ? 'text-green-400' : 'text-slate-600'}`}>
                {fmt(acceptedDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => downloadNdaFile(nda)}
            disabled={!ndaUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Signed NDA
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const NDAManagement = () => {

  const { token, role } = useContext(AppContext);

  const navigate = useNavigate();

  const [ndaData, setNdaData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [selectedNDA, setSelectedNDA] = useState(null);

  const fmt = d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const ndaFiltered = filterStatus === 'all'
    ? ndaData
    : ndaData.filter(n => n.ndaStatus === filterStatus);

  const counts = {
    total: ndaData.length,
    pending: ndaData.filter(n => n.ndaStatus === 'nda_sent').length,
    accepted: ndaData.filter(n => n.ndaStatus === 'accepted').length,
    rejected: ndaData.filter(n => n.ndaStatus === 'rejected').length,
  };

  const statCards = [
    { key: 'total', label: 'Total NDAs', count: counts.total },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const fetchNDAData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/ndas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setNdaData(Array.isArray(data?.ndas) ? data.ndas : []);

    } catch (error) {
      console.error('Error fetching NDA data:', error);
    }
  };

  useEffect(() => {
    if (token && role === 'recruiter') {
      fetchNDAData();
    }
  }, [token, role]);


  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Owner</p>
        <h1 className="text-3xl font-bold text-white mb-1">NDA Management</h1>
        <p className="text-slate-500 text-sm">Track and manage non-disclosure agreements sent to students.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, label, count }) => {
          const { icon: Icon, iconBg, border } = statAccent[key];
          return (
            <div
              key={key}
              className={`bg-slate-900 border ${border} rounded-2xl p-4 flex flex-col gap-3`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map(f => {
          const count = f.value === 'all' ? ndaData.length : ndaData.filter(n => n.ndaStatus === f.value).length;
          const active = filterStatus === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
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
          );
        })}
      </div>

      {/* ── NDA list ── */}
      <div className="flex flex-col gap-4">
        {ndaFiltered.map(nda => (
          <div
            key={nda._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 group"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {nda.projectTitle}
                  </h2>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 inline-block bg-blue-500/10 text-blue-400">
                    NDA Agreement
                  </span>
                </div>
              </div>
              <StatusBadge status={nda.ndaStatus} />
            </div>

            {/* Student info row */}
            <div className="flex items-center gap-3 mb-3 ml-12">
              <div className="w-7 h-7 bg-slate-800 border border-slate-700/50 rounded-full flex items-center justify-center shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-200">{nda.applicationId?.studentId?.name || 'Deleted User'}</p>
                <p className="text-xs text-slate-500">{nda.applicationId?.studentId?.university || 'Unknown'} · {nda.applicationId?.studentId?.email || 'Unknown'}</p>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-3 ml-12">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Send className="w-3 h-3" />
                Sent: <span className="text-slate-300 font-medium ml-0.5">{fmt(nda.createdAt)}</span>
              </span>
              {nda.acceptedDate && (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  Accepted: <span className="font-medium ml-0.5">{fmt(nda.acceptedDate)}</span>
                </span>
              )}
              {getNdaUrl(nda) && (
                <span onClick={() => openNdaInNewTab(nda)} className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer hover:text-white">
                  <FileText className="w-3 h-3" />
                  View NDA document
                </span>
              )}
            </div>

            {/* Divider + actions */}
            <div className="border-t border-slate-800 pt-4 flex items-center gap-2 ml-12">
              <button
                onClick={() => { setSelectedNDA(nda); setShowNDAModal(true); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700/50 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View NDA
              </button>

              <button onClick={() => navigate(`/owner-dashboard/view-details?studentId=${nda.applicationId?.studentId?._id || ''}&projectId=${nda.applicationId?.projectId?._id}`)} className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-500/20 px-3 py-2 rounded-xl hover:bg-blue-500/10 transition-all cursor-pointer">
                <UserIcon className="w-3.5 h-3.5" /> View Applicant
              </button>

              {getNdaUrl(nda) && (
                <button
                  onClick={() => downloadNdaFile(nda)}
                  className="flex items-center gap-1.5 text-xs text-green-400 border border-green-500/20 px-3 py-2 rounded-xl hover:bg-green-500/10 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {ndaFiltered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">No NDAs found</h3>
            <p className="text-slate-500 text-sm mb-5">There are no agreements with this status.</p>
            <button
              onClick={() => setFilterStatus('all')}
              className="flex items-center gap-2 text-sm text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-xl hover:bg-blue-500/10 transition-colors"
            >
              View all NDAs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── NDA Modal ── */}
      {showNDAModal && selectedNDA && (
        <NDAModal nda={selectedNDA} onClose={() => setShowNDAModal(false)} />
      )}
    </div>
  );
};

export default NDAManagement;