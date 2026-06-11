import React, { useState } from 'react';
import {
    ArrowRight,
    Briefcase,
    CheckCircle,
    Globe,
    GraduationCap,
    Heart,
    Lightbulb,
    Mail,
    MapPin,
    Rocket,
    Shield,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';

// ── Unsplash images ─────────────────────────────────────────────────────────
const TEAM_1 = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80'; // founder male
const TEAM_2 = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'; // professional woman
const TEAM_3 = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'; // professional man 2
const TEAM_4 = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'; // woman portrait
const TEAM_5 = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'; // man casual
const TEAM_6 = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'; // woman smiling
const OFFICE_IMG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80'; // modern office
const COLLAB_IMG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80'; // students collaborating
const MISSION_IMG = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80'; // student laptop

// ── Data ────────────────────────────────────────────────────────────────────
const stats = [
    { num: '2023', label: 'Founded' },
    { num: '10,000+', label: 'Active Students' },
    { num: '500+', label: 'Partner Companies' },
    { num: '$2M+', label: 'Earned by Students' },
];

const values = [
    {
        icon: GraduationCap,
        title: 'Students First',
        desc: 'Every feature we build starts with one question: does this genuinely help a student grow, earn, and succeed? We never compromise on that.',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        icon: Shield,
        title: 'Trust & Safety',
        desc: 'We verify every client, escrow every payment, and stand behind every transaction. You should never have to worry about getting paid.',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        icon: Lightbulb,
        title: 'Real-World Impact',
        desc: "We believe the gap between education and employment is a problem worth solving — and that real projects are the best bridge across it.",
        color: 'bg-violet-50 text-violet-600',
    },
    {
        icon: Globe,
        title: 'Inclusive Access',
        desc: 'Talent is everywhere. Opportunity shouldn\'t be reserved for those at elite schools or in major cities. We\'re building for everyone.',
        color: 'bg-orange-50 text-orange-600',
    },
    {
        icon: Heart,
        title: 'Community',
        desc: 'We\'re more than a marketplace. We\'re a network of students, mentors, and companies invested in each other\'s success.',
        color: 'bg-pink-50 text-pink-600',
    },
    {
        icon: TrendingUp,
        title: 'Continuous Growth',
        desc: 'We iterate relentlessly. Every piece of student feedback shapes what we build next. The platform you use today is better than yesterday\'s.',
        color: 'bg-cyan-50 text-cyan-600',
    },
];

const team = [
    { name: 'Alex Rivera', role: 'CEO & Co-Founder', location: 'San Francisco, USA', img: TEAM_1, bio: 'Former PM at Google. Built InsiderJobs after struggling to find real experience as a CS student at Stanford.' },
    { name: 'Priya Menon', role: 'CTO & Co-Founder', location: 'Bangalore, India', img: TEAM_2, bio: 'Ex-Stripe engineer. Obsessed with building systems that scale without losing the human touch.' },
    { name: 'Marcus Williams', role: 'Head of Growth', location: 'New York, USA', img: TEAM_3, bio: 'Led growth at two YC-backed startups before joining InsiderJobs to bring it to every campus.' },
    { name: 'Sophie Laurent', role: 'Head of Design', location: 'Paris, France', img: TEAM_4, bio: 'Award-winning product designer. Believes the best interfaces feel invisible — they just work.' },
    { name: 'James Okafor', role: 'Head of Partnerships', location: 'London, UK', img: TEAM_5, bio: 'Spent 5 years connecting companies with student talent before realising the process needed reinventing.' },
    { name: 'Yuki Tanaka', role: 'Head of Community', location: 'Tokyo, Japan', img: TEAM_6, bio: 'Former university career advisor turned community builder. Manages our global student ambassador network.' },
];

const milestones = [
    { year: '2023', title: 'InsiderJobs Founded', desc: 'Launched out of a Stanford dorm room with 50 beta students and 10 partner companies.' },
    { year: 'Q2 2023', title: '1,000 Students', desc: 'Reached our first thousand active students across 12 universities in 3 countries.' },
    { year: 'Q4 2023', title: 'Seed Funding', desc: 'Raised $2.1M seed round led by Sequoia to accelerate our university partnerships program.' },
    { year: 'Q1 2024', title: '$1M Paid Out', desc: 'Students collectively earned their first million dollars through projects on our platform.' },
    { year: 'Q3 2024', title: '500 Companies', desc: 'Reached 500 verified partner companies posting projects — from solo founders to Fortune 500s.' },
    { year: '2025', title: '10,000+ Students', desc: 'Now serving students from over 200 universities across 40+ countries worldwide.' },
];

const perks = [
    { icon: Rocket, label: 'Fully Remote' },
    { icon: GraduationCap, label: 'Learning Budget' },
    { icon: Heart, label: 'Health Coverage' },
    { icon: Globe, label: 'Work from Anywhere' },
    { icon: Users, label: 'Team Retreats' },
    { icon: Zap, label: 'Equity for All' },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <div className="bg-white text-gray-900 font-sans">
            <Navbar2 />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 min-h-[80vh] flex items-center -mt-18 py-24">
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
                {/* Glow blobs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left – text */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                Our Story
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white mb-6 tracking-tight">
                                We're Closing the{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                                    Experience Gap
                                </span>
                            </h1>
                            <p className="text-md text-slate-300 leading-relaxed mb-8 max-w-lg">
                                InsiderJobs was born from a simple frustration: you need experience to get a job,
                                but you need a job to get experience. We built the platform that breaks that cycle —
                                connecting ambitious students with real paid projects from day one.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <button className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all text-sm">
                                    Join as a Student <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium transition-all text-sm">
                                    Post a Project
                                </button>
                            </div>
                        </div>

                        {/* Right – image + floating card */}
                        <div className="relative hidden lg:block h-[440px]">
                            <div className="absolute top-0 left-0 w-72 h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={COLLAB_IMG} alt="Students collaborating" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />
                            </div>
                            <div className="absolute top-16 right-0 w-56 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={MISSION_IMG} alt="Student on laptop" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 to-transparent" />
                            </div>
                            {/* Floating badge */}
                            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 w-52 shadow-xl">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-slate-300">Student Rating</span>
                                </div>
                                <div className="text-2xl font-bold text-white">4.9 / 5.0</div>
                                <div className="text-xs text-green-400 mt-0.5">From 2,000+ reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <section className="border-y border-gray-100 bg-gray-50 py-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map(s => (
                            <div key={s.label}>
                                <div className="text-3xl font-extrabold text-blue-600 mb-1">{s.num}</div>
                                <div className="text-sm text-gray-500">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── MISSION ── */}
            <section className="py-24 bg-slate-950">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden aspect-4/3">
                            <img src={OFFICE_IMG} alt="Modern office" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-linear-to-tr from-blue-900/40 to-transparent" />
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Mission-Driven</div>
                                <div className="text-xs text-gray-400">Not just a marketplace</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Mission</p>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Make real experience accessible to every student
                        </h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            We believe that where you study shouldn't determine what you can achieve.
                            Too many talented students graduate with a degree but no portfolio, no network, and no practical skills.
                            Meanwhile, thousands of companies struggle to find affordable, motivated talent for their projects.
                        </p>
                        <p className="text-slate-400 mb-10 leading-relaxed">
                            InsiderJobs is the bridge. We match driven university students with real, paid freelance projects
                            from verified companies — creating a win-win that builds careers and ships products at the same time.
                        </p>
                        <div className="space-y-3">
                            {[
                                'Verified companies, real budgets, no scam listings',
                                'Escrow payments so students always get paid',
                                'Portfolio-building projects across every skill set',
                            ].map(item => (
                                <div key={item} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-400 shrink-0" />
                                    <span className="text-slate-300 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── VALUES ── */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">What We Stand For</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        These aren't posters on a wall they're the principles that guide every product decision we make.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {values.map(({ icon: Icon, title, desc, color }) => (
                        <div
                            key={title}
                            className="group bg-white border border-blue-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TIMELINE ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Our Journey</p>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How We Got Here</h2>
                        <p className="text-gray-500">From a dorm-room idea to a global student platform.</p>
                    </div>

                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

                        <div className="space-y-10">
                            {milestones.map((m, i) => (
                                <div
                                    key={m.year}
                                    className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center ${i % 2 === 0 ? '' : 'md:[&>div:first-child]:order-2'}`}
                                >
                                    {/* Content */}
                                    <div className={`${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                                        <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
                                            {m.year}
                                        </span>
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{m.title}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                                    </div>

                                    {/* Center dot */}
                                    <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md hidden md:block" />

                                    {/* Empty spacer for alternating layout */}
                                    <div />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TEAM ── */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">The People</p>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        A small, globally distributed team on a big mission. Formerly from Google, Stripe, and top universities.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {team.map(member => (
                        <div
                            key={member.name}
                            className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300"
                        >
                            <div className="h-56 overflow-hidden">
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 text-base">{member.name}</h3>
                                <p className="text-sm text-blue-600 font-medium mb-1">{member.role}</p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {member.location}
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CAREERS ── */}
            <section className="py-24 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">Join the Team</p>
                            <h2 className="text-4xl font-bold text-white mb-4">Help Us Build the Future of Student Work</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                We're a remote-first team that moves fast, ships often, and genuinely cares about the impact we're making.
                                If you want your work to matter — and enjoy working with people who feel the same — we'd love to hear from you.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                                {perks.map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                        <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                                        <span className="text-sm text-slate-300">{label}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all text-sm">
                                View Open Roles <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Open roles card */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8">
                            <p className="text-slate-300 text-sm font-semibold mb-6">Current Openings</p>
                            <div className="space-y-4">
                                {[
                                    { title: 'Senior Frontend Engineer', dept: 'Engineering', type: 'Full-Time' },
                                    { title: 'Product Designer', dept: 'Design', type: 'Full-Time' },
                                    { title: 'University Partnerships Lead', dept: 'Growth', type: 'Full-Time' },
                                    { title: 'Data Analyst', dept: 'Analytics', type: 'Full-Time' },
                                ].map(role => (
                                    <div
                                        key={role.title}
                                        className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-4 cursor-pointer group transition-all"
                                    >
                                        <div>
                                            <p className="text-white font-medium text-sm">{role.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{role.dept} · {role.type} · Remote</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-6 text-center">
                                Don't see your role? <span className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">Send us a general application →</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">We'd Love to Hear From You</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Whether you're a student, a company, a university, or a journalist — our inbox is always open.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        {[
                            { icon: Mail, label: 'General Enquiries', value: 'hello@insiderjobs.com', color: 'bg-blue-50 text-blue-600' },
                            { icon: Briefcase, label: 'Partnerships', value: 'partners@insiderjobs.com', color: 'bg-emerald-50 text-emerald-600' },
                            { icon: Globe, label: 'Press & Media', value: 'press@insiderjobs.com', color: 'bg-violet-50 text-violet-600' },
                        ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:border-blue-200 hover:shadow-md transition-all">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-400 mb-1">{label}</p>
                                <p className="text-sm font-medium text-gray-900">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-28 bg-slate-950 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto px-6">
                    <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Ready?</p>
                    <h2 className="text-5xl font-extrabold text-white mb-5 leading-tight">
                        Be part of the story
                    </h2>
                    <p className="text-slate-400 text-lg mb-10">
                        Join thousands of students and companies already shaping the future of work together.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button className="flex items-center gap-2 px-7 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all text-sm">
                            I'm a Student <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl font-medium transition-all text-sm">
                            I'm a Project Owner
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}