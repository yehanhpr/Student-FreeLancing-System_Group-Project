import {
    ArrowLeft, Briefcase, Building, CheckCircle,
    FileText, GraduationCap, Lock, Mail, Star,
    Upload, User, X
} from 'lucide-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AppContext } from '../context/AppContext'

// ── Unsplash images ───────────────────────────────────────────────────────────
const STUDENT_IMG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80'
const RECRUITER_IMG = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80'

const studentStats = [
    { value: '10,000+', label: 'Active Students' },
    { value: '$2M+', label: 'Paid Out' },
    { value: '4.9★', label: 'Avg Rating' },
]
const recruiterStats = [
    { value: '5,000+', label: 'Projects Posted' },
    { value: '98%', label: 'Satisfaction' },
    { value: '48hrs', label: 'Avg Hire Time' },
]

// ── Controlled input ──────────────────────────────────────────────────────────
const AuthInput = ({ label, icon: Icon, type = 'text', placeholder, value, onChange, name }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
        <div className="relative">
            {Icon && <Icon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />}
            <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full py-2.5 text-sm bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
            />
        </div>
    </div>
)

// ── Main component ────────────────────────────────────────────────────────────
const AuthPage = () => {
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type') || 'student'
    const mode = searchParams.get('mode') || 'register'

    const { setToken } = useContext(AppContext);

    const navigate = useNavigate()
    const inputRef = useRef(null)

    const isStudent = type === 'student'
    const isRecruiter = type === 'recruiter'
    const isRegister = mode === 'register'

    // ── Form state ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        university: '',
        major: '',
        companyName: '',
    })
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [otp, setOtp] = useState('')
    const [serverOtp, setServerOtp] = useState('')
    const [showOtpStep, setShowOtpStep] = useState(false)

    useEffect(() => {
        setOtp('')
        setServerOtp('')
        setShowOtpStep(false)
        setError('')
        setSuccess('')
    }, [type, mode])

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const BASE_URL = isStudent ? `${import.meta.env.VITE_REACT_BACKEND_URL}/api/student` : `${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter`
    const shouldUseOtpVerification = isRegister && isStudent


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            let response;

            if (isRegister) {
                if (shouldUseOtpVerification && !showOtpStep) {
                    response = await fetch(`${BASE_URL}/send-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formData.name,
                            email: formData.email,
                        }),
                    })

                    const otpResult = await response.json()

                    if (!response.ok) {
                        toast.error(otpResult.message || 'Failed to send OTP')
                        setError(otpResult.message || 'Failed to send OTP')
                        return
                    }

                    setServerOtp(String(otpResult.otp || ''))
                    setShowOtpStep(true)
                    setSuccess(otpResult.message || 'OTP sent to your email')
                    toast.success(otpResult.message || 'OTP sent to your email')
                    return
                }

                if (shouldUseOtpVerification && showOtpStep) {
                    if (!otp.trim() || otp.trim() !== serverOtp) {
                        toast.error('Invalid OTP. Registration failed.')
                        setError('OTP does not match. Registration failed.')
                        navigate('/')
                        return
                    }
                }

                // Registration uses FormData (supports file upload)
                const data = new FormData()
                data.append('name', formData.name)
                data.append('email', formData.email)
                data.append('password', formData.password)

                if (isStudent) {
                    data.append('university', formData.university)
                    data.append('major', formData.major)
                } else {
                    data.append('companyName', formData.companyName)
                }

                if (file) {
                    const fileFieldName = isStudent ? 'resume' : 'companyLogo'
                    data.append(fileFieldName, file)
                }

                response = await fetch(`${BASE_URL}/register`, {
                    method: 'POST',
                    body: data,
                })

            } else {
                // Login uses JSON
                response = await fetch(`${BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                })
            }

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || (isRegister ? 'Account created successfully!' : 'Login successful!'))
                setSuccess(isRegister ? 'Account created successfully!' : 'Login successful!')
                localStorage.setItem('token', result.token);
                setToken(result.token);
                navigate(isStudent ? '/student-dashboard' : '/owner-dashboard');
            } else {
                toast.error(result.message || 'An error occurred')
                setError(result.message || 'An error occurred')
                return
            }

        } catch (err) {
            setError(err.message)
            toast.error(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    // ── UI helpers ────────────────────────────────────────────────────────────
    const heroImg = isStudent ? STUDENT_IMG : RECRUITER_IMG
    const stats = isStudent ? studentStats : recruiterStats
    const fileAccept = isStudent ? '.pdf,.docx' : '.png,.jpg,.jpeg'
    const fileLabel = isStudent ? 'Upload Resume' : 'Company Logo'
    const fileHint = isStudent ? '.pdf, .docx (max 10MB)' : '.png, .jpg, .jpeg (max 10MB)'

    const titles = {
        student: { login: 'Welcome Back', register: 'Join as a Student' },
        recruiter: { login: 'Welcome Back', register: 'Join as a Recruiter' },
    }
    const subtitles = {
        student: { login: 'Sign in to find your next project', register: 'Start earning on real-world projects' },
        recruiter: { login: 'Sign in to manage your projects', register: 'Find talented university students' },
    }

    return (
        <div className="min-h-screen bg-slate-950 flex">

            {/* ── Left panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
                <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-br from-slate-950/90 via-blue-950/70 to-slate-900/80" />
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="flex items-center gap-2 mb-auto">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">Insider<span className="text-blue-400">jobs</span></span>
                    </div>

                    <div className="my-auto">
                        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            {isStudent ? 'Student Portal' : 'Recruiter Portal'}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 leading-snug">
                            {isStudent ? 'Earn while you\nlearn & grow' : 'Hire the best\nstudent talent'}
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs">
                            {isStudent
                                ? 'Join 10,000+ students landing real freelance projects from verified companies.'
                                : 'Access a pool of talented, motivated university students ready to work on your projects.'}
                        </p>
                        <div className="flex gap-6 mb-8">
                            {stats.map(s => (
                                <div key={s.label}>
                                    <p className="text-xl font-bold text-white">{s.value}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-auto">
                        {(isStudent
                            ? ['Browse 5,000+ live projects', 'Get paid securely via escrow', 'Build a verified portfolio']
                            : ['Post projects in minutes', 'Hire verified university talent', 'Milestone-based payments']
                        ).map(item => (
                            <div key={item} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="text-xs text-slate-400">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel: form ── */}
            <div className="flex-1 lg:w-1/2 flex flex-col items-center justify-center p-6 min-h-screen">
                <div className="w-full max-w-md">

                    {/* Back + mobile logo */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </button>
                        <div className="flex items-center gap-1.5 lg:hidden">
                            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                                <Briefcase className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-bold text-sm text-white">Insider<span className="text-blue-400">jobs</span></span>
                        </div>
                    </div>

                    {/* Portal badge */}
                    <div className="flex items-center gap-2 mb-5">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${isStudent
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                            {isStudent ? '🎓 Student Portal' : '🏢 Recruiter Portal'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white mb-1">{titles[type][mode]}</h1>
                    <p className="text-sm text-slate-400 mb-6">{subtitles[type][mode]}</p>

                    {/* Form card */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

                            {/* Full Name (register only) */}
                            {isRegister && (
                                <AuthInput
                                    label="Full Name" icon={User}
                                    placeholder="Enter your full name"
                                    name="name" value={formData.name} onChange={handleChange}
                                />
                            )}

                            {/* Student-only register fields */}
                            {isStudent && isRegister && (
                                <>
                                    <AuthInput
                                        label="University" icon={GraduationCap}
                                        placeholder="Your university"
                                        name="university" value={formData.university} onChange={handleChange}
                                    />
                                    <AuthInput
                                        label="Degree / Major"
                                        placeholder="e.g., Computer Science"
                                        name="major" value={formData.major} onChange={handleChange}
                                    />
                                </>
                            )}

                            {/* Recruiter-only register field */}
                            {!isStudent && isRegister && (
                                <AuthInput
                                    label="Company Name" icon={Building}
                                    placeholder="Your company name"
                                    name="companyName" value={formData.companyName} onChange={handleChange}
                                />
                            )}

                            {/* Email */}
                            <AuthInput
                                label="Email" icon={Mail} type="email"
                                placeholder="your@email.com"
                                name="email" value={formData.email} onChange={handleChange}
                            />

                            {/* Password */}
                            <AuthInput
                                label="Password" icon={Lock} type="password"
                                placeholder="••••••••"
                                name="password" value={formData.password} onChange={handleChange}
                            />

                            {/* Forgot password (login only) */}
                            {!isRegister && (
                                <div className="flex justify-end -mt-2">
                                    <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                                        Forgot password?
                                    </button>
                                </div>
                            )}

                            {/* File upload (register only) */}
                            {isRegister && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{fileLabel}</label>
                                    {!file ? (
                                        <div
                                            onClick={() => inputRef.current?.click()}
                                            className="border border-dashed border-slate-600 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
                                        >
                                            <Upload className="w-7 h-7 text-slate-600" />
                                            <p className="text-sm text-slate-400">Click to upload or drag and drop</p>
                                            <p className="text-xs text-slate-600">{fileHint}</p>
                                            <input
                                                ref={inputRef}
                                                type="file"
                                                accept={fileAccept}
                                                className="hidden"
                                                onChange={e => setFile(e.target.files[0])}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {shouldUseOtpVerification && showOtpStep && (
                                <>
                                    <AuthInput
                                        label="Enter OTP"
                                        placeholder="6-digit OTP"
                                        name="otp"
                                        value={otp}
                                        onChange={(e) => {
                                            setOtp(e.target.value)
                                            setError('')
                                        }}
                                    />
                                    <p className="text-xs text-slate-500 -mt-2">
                                        We sent a verification code to your email. Enter it to complete registration.
                                    </p>
                                </>
                            )}

                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
                                    <X className="w-3.5 h-3.5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Success message */}
                            {success && (
                                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-4 py-3 rounded-xl">
                                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                    {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors mt-1 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {isRegister
                                            ? shouldUseOtpVerification && !showOtpStep
                                                ? 'Sending OTP...'
                                                : 'Creating Account...'
                                            : 'Logging in...'}
                                    </>
                                ) : (
                                    isRegister
                                        ? shouldUseOtpVerification && !showOtpStep
                                            ? 'Send OTP'
                                            : 'Verify OTP & Create Account'
                                        : 'Login'
                                )}
                            </button>

                            {/* Toggle mode */}
                            <p className="text-center text-xs text-slate-500">
                                {isRegister ? 'Already have an account?' : "Don't have an account?"}
                                {' '}
                                <button
                                    type="button"
                                    className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
                                    onClick={() => navigate(`/auth?type=${type}&mode=${isRegister ? 'login' : 'register'}`)}
                                >
                                    {isRegister ? 'Login' : 'Register'}
                                </button>
                            </p>
                        </form>
                    </div>

                    {/* Switch portal */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-slate-600">
                            {isStudent ? 'Are you a recruiter?' : 'Are you a student?'}
                            {' '}
                            <button
                                type="button"
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                onClick={() => navigate(`/auth?type=${isStudent ? 'recruiter' : 'student'}&mode=${mode}`)}
                            >
                                Switch to {isStudent ? 'Recruiter' : 'Student'} portal →
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage