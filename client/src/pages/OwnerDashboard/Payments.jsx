import {
  AlertTriangle, ArrowRight, Briefcase, CheckCircle,
  Clock, CreditCard, DollarSign, FileText, Lock,
  Send, Star, TrendingUp, Users, Wallet, X
} from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'


const statusConfig = {
  'submitted': { label: 'Submitted', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'completed': { label: 'Completed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  'paid': { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'in progress': { label: 'In Progress', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
}
const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`text-xs font-medium px-3 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
}

const Backdrop = ({ onClick }) => (
  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClick} />
)


// ─────────────────────────────────────────────────────────────────────────────
// API functions — wired to real backend
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all projects in-progress or completed for this recruiter.
 * GET /api/recruiter/assigned-projects
 */
const fetchCompletedProjects = async (token) => {
  const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/assigned-projects`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load projects')
  return data.projects
}

/**
 * Process a payment for a completed project.
 * POST /api/recruiter/process-payment
 */
const processPayment = async (token, payload) => {
  const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/process-payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectId: payload.projectId, amount: payload.amount })
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Payment failed')
  return { success: true, transactionId: data.transactionId }
}

/**
 * Submit a review for a student after payment.
 * POST /api/recruiter/submit-review
 */
const submitStudentReview = async (token, payload) => {
  const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/submit-review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit review')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category colour map
// ─────────────────────────────────────────────────────────────────────────────
const catColor = {
  'Web Development': 'bg-blue-500/10 text-blue-400',
  'API Development': 'bg-cyan-500/10 text-cyan-400',
  'Data Analysis': 'bg-yellow-500/10 text-yellow-400',
  'Marketing': 'bg-pink-500/10 text-pink-400',
  'UI/UX Design': 'bg-purple-500/10 text-purple-400',
  'Mobile Development': 'bg-orange-500/10 text-orange-400',
}

// ─────────────────────────────────────────────────────────────────────────────
// Star rating picker (used in review step)
// ─────────────────────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110 cursor-pointer"
      >
        <Star className={`w-7 h-7 transition-colors ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
      </button>
    ))}
    {value > 0 && (
      <span className="ml-2 text-sm font-semibold text-yellow-400">{value}.0</span>
    )}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Payment + Review Modal (3 steps)
// ─────────────────────────────────────────────────────────────────────────────
const MODAL_STEPS = { PAYMENT: 1, PROCESSING: 2, REVIEW: 3, DONE: 4 }

const PaymentModal = ({ project, token, onClose, onSuccess }) => {
  const [step, setStep] = useState(MODAL_STEPS.PAYMENT)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [error, setError] = useState('')
  const [txnId, setTxnId] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const student = project.assignedStudent
  const platformFee = Math.round(project.budget * 0.05)
  const total = project.budget + platformFee

  // Format card number with spaces
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNumber(val.replace(/(.{4})/g, '$1 ').trim())
  }

  const handleExpiry = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4)
    if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2)
    setExpiry(val)
  }

  const handlePay = async () => {
    if (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 16 || expiry.length < 5 || cvv.length < 3) {
      setError('Please fill in all card details correctly.')
      return
    }
    setError('')
    setStep(MODAL_STEPS.PROCESSING)
    try {
      const result = await processPayment(token, {
        projectId: project._id,
        studentId: student._id,
        amount: total,
      })
      if (result.success) {
        setTxnId(result.transactionId)
        toast.success('Payment processed successfully!')
        setStep(MODAL_STEPS.REVIEW)
      }
    } catch (err) {
      setStep(MODAL_STEPS.PAYMENT)
      setError(err.message || 'Payment failed. Please try again.')
      toast.error(err.message || 'Payment failed.')
    }
  }

  const handleReview = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setError('')
    setReviewLoading(true)
    try {
      await submitStudentReview(token, {
        projectId: project._id,
        studentId: student._id,
        rating,
        comment,
      })
      toast.success('Review submitted!')
      setStep(MODAL_STEPS.DONE)
      onSuccess(project._id)
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleSkipReview = () => {
    setStep(MODAL_STEPS.DONE)
    onSuccess(project._id)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <Backdrop onClick={step !== MODAL_STEPS.PROCESSING ? onClose : undefined} />

      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* ── Step indicator ── */}
        <div className="flex items-center px-6 pt-5 pb-4 gap-2 border-b border-slate-800">
          {[
            { s: MODAL_STEPS.PAYMENT, label: 'Payment' },
            { s: MODAL_STEPS.REVIEW, label: 'Review' },
            { s: MODAL_STEPS.DONE, label: 'Done' },
          ].map(({ s, label }, i, arr) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s
                  ? step === MODAL_STEPS.PROCESSING && s === MODAL_STEPS.PAYMENT ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-500'
                  }`}>
                  {step > s && s !== MODAL_STEPS.PROCESSING ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-white' : 'text-slate-600'}`}>{label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-px bg-slate-800 mx-1">
                  <div className={`h-full bg-blue-600 transition-all duration-500 ${step > s ? 'w-full' : 'w-0'}`} />
                </div>
              )}
            </React.Fragment>
          ))}

          {step !== MODAL_STEPS.PROCESSING && (
            <button onClick={onClose} className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="p-6">

          {/* ────────── STEP 1: PAYMENT FORM ────────── */}
          {step === MODAL_STEPS.PAYMENT && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">{project.title}</p>
                <h2 className="text-xl font-bold text-white">{student.name}</h2>
              </div>

              {/* Card details */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Card Details</p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500">Cardholder Name</label>
                    <input
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      placeholder="John Williams"
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-500">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        value={cardNumber}
                        onChange={handleCardNumber}
                        placeholder="1234 5678 9012 3456"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-500">Expiry Date</label>
                      <input
                        value={expiry}
                        onChange={handleExpiry}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-500">CVV</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          value={cvv}
                          onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="•••"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount breakdown */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Project Amount</span>
                  <span className="text-white font-medium">${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Platform Fee (5%)</span>
                  <span className="text-white font-medium">${platformFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className="text-base font-bold text-green-400">${total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Lock className="w-3 h-3 shrink-0" />
                Payments are secured and encrypted. Funds released to student upon confirmation.
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handlePay} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer">
                  <CreditCard className="w-4 h-4" /> Pay ${total.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {/* ────────── STEP 1.5: PROCESSING ────────── */}
          {step === MODAL_STEPS.PROCESSING && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">Processing Payment…</h3>
              <p className="text-sm text-slate-400">Please wait while we securely process your payment.</p>
              <p className="text-xs text-slate-600 mt-3">Do not close this window.</p>
            </div>
          )}

          {/* ────────── STEP 2: REVIEW ────────── */}
          {step === MODAL_STEPS.REVIEW && (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-widest mb-1">Payment Successful</p>
                <h2 className="text-xl font-bold text-white">Review the Student</h2>
              </div>

              {/* Success banner */}
              <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Payment of ${total.toLocaleString()} sent!</p>
                  <p className="text-xs text-slate-500 mt-0.5">Transaction ID: <span className="text-slate-400 font-mono">{txnId}</span></p>
                </div>
              </div>

              {/* Student card */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.university}</p>
                  <p className="text-xs text-slate-600">{project.title}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-semibold">{student.rating} current</span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-2">Overall Rating *</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Comment */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wide font-semibold block mb-2">Review Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience working with this student — quality of work, communication, timeliness…"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleSkipReview} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all cursor-pointer">
                  Skip Review
                </button>
                <button
                  onClick={handleReview}
                  disabled={reviewLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {reviewLoading
                    ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Submitting…</>
                    : <><Send className="w-4 h-4" /> Submit Review</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ────────── STEP 3: ALL DONE ────────── */}
          {step === MODAL_STEPS.DONE && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All Done!</h3>
              <p className="text-sm text-slate-400 mb-1">Payment sent & review submitted.</p>
              <p className="text-xs text-slate-600">The student has been notified about their payment and feedback.</p>
              <button onClick={onClose} className="mt-6 px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Payments Component
// ─────────────────────────────────────────────────────────────────────────────
const Payments = () => {
  const { user, token } = useContext(AppContext)

  const [completedProjects, setCompletedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [payingProject, setPayingProject] = useState(null) // project selected for payment modal

  // ── Load data on mount ──
  useEffect(() => {
    if (!token) return
    const load = async () => {
      setLoading(true)
      try {
        const projects = await fetchCompletedProjects(token)
        setCompletedProjects(projects)
      } catch (err) {
        toast.error(err.message || 'Failed to load payment data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  // ── Mark project as paid after successful payment ──
  const handlePaymentSuccess = (projectId) => {
    setCompletedProjects(prev =>
      prev.map(p => p._id === projectId ? { ...p, paymentStatus: 'paid', status: 'completed' } : p)
    )
  }

  const unpaid = completedProjects.filter(p => p.paymentStatus === 'unpaid')
  const paid = completedProjects.filter(p => p.paymentStatus === 'paid')

  const filtered = activeFilter === 'unpaid' ? unpaid
    : activeFilter === 'paid' ? paid
      : completedProjects

  const totalPaid = paid.reduce((s, p) => s + p.budget, 0)
  const totalPending = unpaid.reduce((s, p) => s + p.budget, 0)

  const filters = [
    { value: 'all', label: 'All', count: completedProjects.length },
    { value: 'unpaid', label: 'Awaiting Payment', count: unpaid.length },
    { value: 'paid', label: 'Paid', count: paid.length },
  ]

  return (
    <div className="min-h-screen space-y-6">

      {/* ── Page header ── */}
      <div className="mb-2">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Finance</p>
        <h1 className="text-3xl font-bold text-white mb-1">Payment Management</h1>
        <p className="text-slate-500 text-sm">Manage payments for completed projects and view transaction history.</p>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Paid Out', value: `$${totalPaid.toLocaleString()}`, color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20' },
          { icon: Clock, label: 'Pending Payments', value: `$${totalPending.toLocaleString()}`, color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20' },
          { icon: Briefcase, label: 'Projects Completed', value: paid.length, color: 'bg-blue-500/10 text-blue-400', border: 'border-blue-500/20' },
          { icon: Users, label: 'Awaiting Payment', value: unpaid.length, color: 'bg-purple-500/10 text-purple-400', border: 'border-purple-500/20' },
        ].map(({ icon: Icon, label, value, color, border }) => (
          <div key={label} className={`bg-slate-900 border ${border} rounded-2xl p-5`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Project list ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Completed Projects</h2>
          {unpaid.length > 0 && (
            <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full font-medium">
              {unpaid.length} awaiting payment
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${activeFilter === f.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:text-white hover:border-slate-600'
                }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${activeFilter === f.value ? 'bg-white/20' : 'bg-slate-700 text-slate-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-4 bg-slate-700 rounded w-1/3" />
                  <div className="h-6 bg-slate-700 rounded-full w-20" />
                </div>
                <div className="flex gap-4 mb-3">
                  <div className="h-3 bg-slate-700 rounded w-16" />
                  <div className="h-3 bg-slate-700 rounded w-20" />
                </div>
                <div className="border-t border-slate-700 pt-3 flex gap-2">
                  <div className="h-8 bg-slate-700 rounded-xl w-24" />
                  <div className="h-8 bg-slate-700 rounded-xl w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-white font-medium text-sm mb-1">No projects found</p>
            <p className="text-slate-500 text-xs">
              {activeFilter === 'unpaid'
                ? 'All completed projects have been paid.'
                : activeFilter === 'paid'
                  ? 'No paid projects yet.'
                  : 'No completed projects yet.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(project => (
              <div key={project._id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/20 transition-all group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 mt-0.5 ${catColor[project.category] || 'bg-slate-700 text-slate-400'}`}>
                      {project.category}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug">
                        {project.title}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={project.paymentStatus === 'paid' ? 'paid' : project.status} />
                </div>

                {/* Student */}
                <div className="flex items-center gap-3 ml-0 mb-3 bg-slate-800/50 rounded-xl px-3 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {project.assignedStudent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{project.assignedStudent.name}</p>
                    <p className="text-xs text-slate-500 truncate">{project.assignedStudent.university}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-medium">{project.assignedStudent.rating}</span>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-bold">
                    <DollarSign className="w-3 h-3" />${project.budget.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />Submitted: {new Date(project.submittedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <FileText className="w-3 h-3" />Deadline: {new Date(project.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Action */}
                <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                  {project.paymentStatus === 'unpaid' ? (
                    <button
                      onClick={() => setPayingProject(project)}
                      className="flex items-center gap-2 text-xs text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/30 px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now · ${project.budget.toLocaleString()}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Payment Completed
                    </span>
                  )}
                  <button className="flex items-center gap-1.5 text-xs text-slate-400 border border-slate-700/50 px-3 py-2 rounded-xl hover:text-white hover:border-slate-600 transition-all cursor-pointer">
                    <FileText className="w-3 h-3" /> View Submission
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Payment History ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-semibold text-white">Transaction History</h2>
          <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full">{paid.length} records</span>
        </div>

        {paid.length === 0 ? (
          <p className="text-slate-500 text-sm py-8 text-center">No transactions yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {paid.map(p => (
              <div key={p._id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3.5 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">To: {p.assignedStudent?.name} · Credit Card · {new Date(p.submittedDate || p.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-green-400">+${p.budget.toLocaleString()}</span>
                  <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {payingProject && (
        <PaymentModal
          project={payingProject}
          token={token}
          onClose={() => setPayingProject(null)}
          onSuccess={(id) => {
            handlePaymentSuccess(id)
            setPayingProject(null)
          }}
        />
      )}
    </div>
  )
}

export default Payments