import {
    ArrowRight, Briefcase, CheckCircle, ChevronRight,
    DollarSign, Globe, GraduationCap, LayoutGrid,
    Mail, MapPin, MessageSquare, Rocket, Shield,
    Star, TrendingUp, Users, Zap
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';
import Navbar2 from '../components/Navbar2';
import { AppContext } from '../context/AppContext';
import { useContext } from 'react';
import Footer from '../components/Footer';

// ── Unsplash images (free to use) ──────────────────────────────────────────
const HERO_IMG_1 = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80'; // students collaborating
const HERO_IMG_2 = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80'; // student working laptop
const HERO_IMG_3 = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80'; // professional woman
const HERO_IMG_4 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80'; // professional man
const HERO_IMG_5 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80'; // student portrait
const WORK_IMG_1 = 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&q=80'; // team working
const WORK_IMG_2 = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=80'; // remote work
const TRUST_IMG = 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80'; // office meeting

// ── Data ───────────────────────────────────────────────────────────────────
const stats = [
    { num: '10,000+', label: 'Active Students' },
    { num: '5,000+', label: 'Projects Posted' },
    { num: '$2M+', label: 'Paid to Students' },
    { num: '4.9★', label: 'Average Rating' },
];

const steps = [
    { icon: GraduationCap, num: '01', title: 'Create Your Profile', desc: 'Sign up as a student or project owner. Add your skills, portfolio, and experience in minutes.' },
    { icon: LayoutGrid, num: '02', title: 'Browse Projects', desc: 'Explore hundreds of real-world projects posted by verified companies and startups.' },
    { icon: MessageSquare, num: '03', title: 'Apply & Connect', desc: 'Submit your CV and project plan. Chat directly with project owners before committing.' },
    { icon: DollarSign, num: '04', title: 'Get Paid Securely', desc: 'Complete milestones and receive payments through our secure escrow system.' },
];

const categories = [
    { icon: Globe, label: 'Web Development', count: 345, color: 'bg-blue-50 text-blue-600' },
    { icon: Zap, label: 'Machine Learning', count: 128, color: 'bg-green-50 text-green-600' },
    { icon: LayoutGrid, label: 'UI/UX Design', count: 198, color: 'bg-purple-50 text-purple-600' },
    { icon: Rocket, label: 'Mobile Development', count: 106, color: 'bg-orange-50 text-orange-600' },
    { icon: TrendingUp, label: 'Data Analysis', count: 92, color: 'bg-yellow-50 text-yellow-600' },
    { icon: MessageSquare, label: 'Content Writing', count: 134, color: 'bg-pink-50 text-pink-600' },
];


const testimonials = [
    { name: 'Sarah Chen', role: 'CS Student, MIT', avatar: HERO_IMG_5, color: 'bg-blue-600', rating: 5, text: '"I earned $3,500 last semester on real projects. The experience helped me land a full-time offer at a top tech company. InsiderJobs is a game changer for students."' },
    { name: 'Mike Johnson', role: 'Startup Founder', avatar: HERO_IMG_4, color: 'bg-violet-600', rating: 5, text: '"Found talented students who deliver quality work at reasonable rates. Our MVP was built 3x faster. The platform handles payments and contracts seamlessly."' },
    { name: 'Emma Davis', role: 'Design Student, UCLA', avatar: HERO_IMG_3, color: 'bg-cyan-600', rating: 5, text: '"Built my entire portfolio while earning money. The projects are real, the clients are professional, and the support team is always responsive."' },
];

const features = [
    { icon: Shield, title: 'Verified Clients', desc: 'Every project owner is identity-verified before posting. No scams, no fake listings.' },
    { icon: DollarSign, title: 'Escrow Payments', desc: 'Funds are held securely until you complete milestones. You always get paid for your work.' },
    { icon: Users, title: 'University Network', desc: 'Exclusive to verified university students. Higher quality, better trust, stronger community.' },
    { icon: Zap, title: 'Instant Matching', desc: 'Our AI matches your skills to the right projects so you spend less time searching.' },
];

const logos = ['Google', 'Microsoft', 'Amazon', 'Stripe', 'Figma', 'Notion', 'Vercel', 'Linear'];

// ── Component ──────────────────────────────────────────────────────────────
export default function HomePage() {

    const navigate = useNavigate();

    const {projects} = useContext(AppContext);

    return (
        <div className="bg-white text-gray-900 font-sans">

            {/* ── NAV ── */}
            <Navbar2 />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 min-h-[90vh] flex items-center -mt-18 pt-20">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-linear(rgba(255,255,255,.15) 1px,transparent 1px),linear-linear(90deg,rgba(255,255,255,.15) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

                {/* Blue glow blobs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left – text */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                5,000+ live projects waiting for you
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white mb-6 tracking-tight">
                                Connect Students With{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                                    Real-World Projects
                                </span>
                            </h1>

                            <p className="text-md text-slate-300 leading-relaxed mb-8 max-w-lg">
                                The premier platform matching university students with paid freelance opportunities.
                                Build your portfolio, earn money, and gain real-world experience.
                            </p>

                            <div className="flex flex-wrap gap-3 mb-10">
                                <button className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all text-sm">
                                    Find Projects <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all text-sm">
                                    Post a Project
                                </button>
                            </div>

                            {/* Stat row */}
                            <div className="flex flex-wrap gap-6">
                                {stats.map(s => (
                                    <div key={s.label}>
                                        <div className="text-xl font-bold text-white">{s.num}</div>
                                        <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right – image collage */}
                        <div className="relative hidden lg:block h-[520px]">
                            {/* Main large image */}
                            <div className="absolute top-0 left-0 w-72 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={HERO_IMG_1} alt="Students collaborating" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
                            </div>

                            {/* Second image — offset right */}
                            <div className="absolute top-16 right-0 w-56 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={HERO_IMG_2} alt="Student on laptop" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 to-transparent" />
                            </div>

                            {/* Third image — bottom left overlap */}
                            <div className="absolute bottom-0 left-16 w-56 h-52 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={WORK_IMG_1} alt="Team working" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 to-transparent" />
                            </div>

                            {/* Floating stat card */}
                            <div className="absolute bottom-10 right-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 w-48 shadow-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-slate-300">New this week</span>
                                </div>
                                <div className="text-2xl font-bold text-white">248</div>
                                <div className="text-xs text-green-400 mt-0.5">↑ 18% vs last week</div>
                            </div>

                            {/* Floating avatar group */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-xl">
                                <div className="flex -space-x-2 mb-2">
                                    {[HERO_IMG_5, HERO_IMG_3, HERO_IMG_4].map((src, i) => (
                                        <img key={i} src={src} alt="" className="w-8 h-8 rounded-full border-2 border-slate-800 object-cover" />
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-800 bg-blue-600 flex items-center justify-center text-white text-xs font-bold">+9</div>
                                </div>
                                <p className="text-xs text-slate-300">12 applied today</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUSTED BY ── */}
            <section className="border-y border-gray-100 bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-6">Trusted by students from top universities & companies</p>
                    <div className="flex flex-wrap justify-center gap-8">
                        {logos.map(l => (
                            <span key={l} className="text-gray-300 font-semibold text-sm tracking-wide">{l}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Get started in 4 steps</h2>
                    <p className="text-gray-500 max-w-md mx-auto">From signup to getting paid — our streamlined process gets you earning in days, not months.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map(({ icon: Icon, num, title, desc }) => (
                        <div key={num} className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300">
                            <div className="absolute top-6 right-6 text-5xl font-black text-gray-50 group-hover:text-blue-50 transition-colors select-none">{num}</div>
                            <div className="w-11 h-11 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
                                <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SPLIT SECTION – image + features ── */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden aspect-4/3">
                            <img src={TRUST_IMG} alt="Team meeting" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-linear-to-tr from-blue-900/40 to-transparent" />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">100% Verified</div>
                                <div className="text-xs text-gray-400">All clients & projects</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Why InsiderJobs</p>
                        <h2 className="text-4xl font-bold text-white mb-4">Built for students, trusted by businesses</h2>
                        <p className="text-slate-400 mb-10 leading-relaxed">We've designed every feature with both students and project owners in mind. Safe, transparent, and rewarding for everyone.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {features.map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                        <Icon className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── LATEST PROJECTS ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Open Now</p>
                            <h2 className="text-4xl font-bold text-gray-900">Latest Projects</h2>
                        </div>
                        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:gap-3 transition-all cursor-pointer">
                            View All <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projects.slice(0, 6).map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CATEGORIES ── */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Explore</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Browse by Category</h2>
                    <p className="text-gray-500">Find projects in your area of expertise</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map(({ icon: Icon, label, count, color }) => (
                        <div key={label} className="group flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-5 py-4 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{count} projects</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOR STUDENTS / OWNERS SPLIT ── */}
            <section className="py-24 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 relative">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Students */}
                    <div className="relative rounded-3xl overflow-hidden bg-blue-900 p-10 flex flex-col justify-between min-h-[380px]">
                        <img src={HERO_IMG_2} alt="student" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">I'm a Student</h3>
                            <p className="text-blue-100 leading-relaxed mb-6 max-w-xs">Find real projects, earn money, and build a portfolio that gets you hired. Join 10,000+ students already earning.</p>
                            <ul className="space-y-2 mb-8">
                                {['Browse 5,000+ live projects', 'Get paid securely via escrow', 'Build a verified portfolio'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                                        <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button className="relative z-10 self-start flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
                            Get Started <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Owners */}
                    <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-10 flex flex-col justify-between min-h-[380px]">
                        <img src={WORK_IMG_2} alt="owner" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">I'm a Project Owner</h3>
                            <p className="text-slate-400 leading-relaxed mb-6 max-w-xs">Access a pool of talented, motivated university students. Get quality work done fast, at student-friendly rates.</p>
                            <ul className="space-y-2 mb-8">
                                {['Post projects in minutes', 'Hire verified university talent', 'Milestone-based payments'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                        <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button className="relative z-10 self-start flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                            Post a Project <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Reviews</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">What our users say</h2>
                    <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                        <span className="ml-2 text-gray-500 text-sm">4.9 out of 5 from 2,000+ reviews</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map(({ name, role, avatar, color, rating, text }) => (
                        <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <img src={avatar} alt={name} className="w-11 h-11 rounded-full object-cover object-top" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                                    <p className="text-xs text-gray-400">{role}</p>
                                </div>
                            </div>
                            <div className="flex gap-0.5 mb-3">
                                {[...Array(rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── NEWSLETTER ── */}
            <section className="py-16 bg-blue-50 border-y border-blue-100">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <Mail className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Stay in the loop</h2>
                    <p className="text-gray-500 mb-6">Get the latest projects and opportunities delivered to your inbox every week.</p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input type="email" placeholder="your@university.edu" className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                        <button className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">Subscribe</button>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 bg-slate-950 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto px-6">
                    <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Ready?</p>
                    <h2 className="text-5xl font-extrabold text-white mb-5 leading-tight">Start earning while you learn</h2>
                    <p className="text-slate-400 text-lg mb-10">Join thousands of students and project owners already using InsiderJobs.</p>
                    <div className="flex gap-4 justify-center">
                        <button className="flex items-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all text-sm">
                            I'm a Student <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-medium transition-all text-sm">
                            I'm a Project Owner
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <Footer />
        </div>
    );
}
