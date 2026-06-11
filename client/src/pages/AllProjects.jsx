import React, { useContext, useState } from 'react';
import {
    ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ChevronRight,
    Clock, DollarSign, Tag, SlidersHorizontal, X,
    Globe, Zap, LayoutGrid, Rocket, TrendingUp, MessageSquare,
    Star, Users, MapPin, Briefcase, Search
} from 'lucide-react';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import { AppContext } from '../context/AppContext';

// ── Data ───────────────────────────────────────────────────────────────────
const categories = [
    { label: 'All Categories', value: 'all', icon: LayoutGrid },
    { label: 'Web Development', value: 'web development', icon: Globe, count: 345 },
    { label: 'Machine Learning', value: 'machine learning', icon: Zap, count: 128 },
    { label: 'UI/UX Designing', value: 'ui/ux designing', icon: LayoutGrid, count: 198 },
    { label: 'Mobile Development', value: 'mobile development', icon: Rocket, count: 106 },
    { label: 'Data Analysis', value: 'data analysis', icon: TrendingUp, count: 92 },
    { label: 'API Development', value: 'api development', icon: MessageSquare, count: 134 },
];

const budgetOptions = [
    { label: '$0 – $500', value: '0-500' },
    { label: '$500 – $1,000', value: '500-1000' },
    { label: '$1,000 – $2,000', value: '1000-2000' },
    { label: '$2,000+', value: '2000-999999' },
];

const deadlineOptions = [
    { label: 'Under 1 week', value: '1-7' },
    { label: '1 – 2 weeks', value: '8-14' },
    { label: '2 – 4 weeks', value: '15-30' },
    { label: '1+ month', value: '31-999' },
];

const allSkills = [
    'React', 'Vue.js', 'Angular', 'Next.js', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Neural Networks', 'Deep Learning',
    'Figma', 'Adobe XD', 'Sketch', 'Wireframing', 'Prototyping', 'User Research',
    'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android',
    'Python', 'Pandas', 'NumPy', 'Data Visualization', 'SQL', 'Excel',
    'REST API', 'GraphQL', 'FastAPI', 'Django', 'Flask', 'Microservices',
];


const ITEMS_PER_PAGE = 8;

// ── FilterSection sub-component ────────────────────────────────────────────
function FilterSection({ title, icon: Icon, expanded, onToggle, children }) {
    return (
        <div className="border-b border-gray-100 pb-5">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full mb-4 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer group"
            >
                <span className="flex items-center gap-2 text-sm font-semibold">
                    {Icon && <Icon className="w-4 h-4" />}
                    {title}
                </span>
                {expanded
                    ? <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />}
            </button>
            {expanded && <div className="space-y-2.5">{children}</div>}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AllProjects() {

    const { projects, setProjects } = useContext(AppContext);

    const [categoryExpanded, setCategoryExpanded] = useState(true);
    const [budgetExpanded, setBudgetExpanded] = useState(true);
    const [deadlineExpanded, setDeadlineExpanded] = useState(true);
    const [skillsExpanded, setSkillsExpanded] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [budgetRanges, setBudgetRanges] = useState([]);
    const [deadlineRanges, setDeadlineRanges] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const toggle = (setter) => (value) =>
        setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

    const convertDeadlineToDays = (str) => {
        if (!str) return null;
        const [num, unit] = str.toLowerCase().split(' ');
        const v = Number(num);
        if (unit?.startsWith('week')) return v * 7;
        if (unit?.startsWith('day')) return v;
        return null;
    };

    const activeFilterCount =
        (selectedCategory !== 'all' ? 1 : 0) +
        budgetRanges.length +
        deadlineRanges.length +
        selectedSkills.length;

    const normalize = (value) =>
        value
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    const filteredProjects = projects.filter(p => {
        if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory) return false;

        if (searchQuery.trim()) {
            const terms = normalize(searchQuery).split(' ').filter(Boolean);
            const searchableContent = normalize([
                p.title,
                p.description,
                p.category,
                p.deadline,
                ...p.technologies,
            ].join(' '));

            const matchesAllTerms = terms.every(term => searchableContent.includes(term));
            if (!matchesAllTerms) return false;
        }

        if (budgetRanges.length) {
            const inBudget = budgetRanges.some(r => {
                const [min, max] = r.split('-').map(Number);
                return p.budget >= min && p.budget <= max;
            });
            if (!inBudget) return false;
        }
        if (deadlineRanges.length) {
            const days = convertDeadlineToDays(p.deadline);
            const ok = deadlineRanges.some(r => {
                const [min, max] = r.split('-').map(Number);
                return days >= min && days <= max;
            });
            if (!ok) return false;
        }
        if (selectedSkills.length && !selectedSkills.some(s => p.skills.includes(s))) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
    const currentProjects = filteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearAll = () => {
        setSelectedCategory('all');
        setBudgetRanges([]);
        setDeadlineRanges([]);
        setSelectedSkills([]);
        setSearchQuery('');
        setCurrentPage(1);
    };

    // ── Sidebar filter panel (shared between desktop and mobile) ───────────
    const FilterPanel = () => (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </h2>
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                    >
                        <X className="w-3 h-3" /> Clear all
                    </button>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Category */}
            <FilterSection
                title="Category"
                icon={Tag}
                expanded={categoryExpanded}
                onToggle={() => setCategoryExpanded(p => !p)}
            >
                {categories.map(cat => (
                    <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="radio"
                            name="category"
                            value={cat.value}
                            checked={selectedCategory === cat.value}
                            onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
                        />
                        <span className={`text-sm flex-1 transition-colors ${selectedCategory === cat.value ? 'text-blue-600 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {cat.label}
                        </span>
                        {cat.count && (
                            <span className="text-xs text-gray-300">{cat.count}</span>
                        )}
                    </label>
                ))}
            </FilterSection>

            {/* Budget */}
            <FilterSection
                title="Budget Range"
                icon={DollarSign}
                expanded={budgetExpanded}
                onToggle={() => setBudgetExpanded(p => !p)}
            >
                {budgetOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={budgetRanges.includes(opt.value)}
                            onChange={() => { toggle(setBudgetRanges)(opt.value); setCurrentPage(1); }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                        />
                        <span className={`text-sm transition-colors ${budgetRanges.includes(opt.value) ? 'text-blue-600 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {opt.label}
                        </span>
                    </label>
                ))}
            </FilterSection>

            {/* Deadline */}
            <FilterSection
                title="Deadline"
                icon={Clock}
                expanded={deadlineExpanded}
                onToggle={() => setDeadlineExpanded(p => !p)}
            >
                {deadlineOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={deadlineRanges.includes(opt.value)}
                            onChange={() => { toggle(setDeadlineRanges)(opt.value); setCurrentPage(1); }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                        />
                        <span className={`text-sm transition-colors ${deadlineRanges.includes(opt.value) ? 'text-blue-600 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                            {opt.label}
                        </span>
                    </label>
                ))}
            </FilterSection>

            {/* Skills */}
            <FilterSection
                title="Required Skills"
                expanded={skillsExpanded}
                onToggle={() => setSkillsExpanded(p => !p)}
            >
                <div className="max-h-64 overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
                    {allSkills.map(skill => (
                        <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedSkills.includes(skill)}
                                onChange={() => { toggle(setSelectedSkills)(skill); setCurrentPage(1); }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                            />
                            <span className={`text-sm transition-colors ${selectedSkills.includes(skill) ? 'text-blue-600 font-medium' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {skill}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );

    return (
        <div className="bg-white text-gray-900 font-sans min-h-screen">
            <Navbar2 />

            {/* ── HERO BANNER ── */}
            <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 py-20 -mt-18 min-h-[85vh] flex flex-col justify-center items-center">
                {/* Glow blobs */}
                <div className="absolute top-10 left-1/4 w-96 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-72 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-medium px-4 py-2 rounded-full mb-6">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        {projects.length} projects open right now
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                        Browse{' '}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                            All Projects
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base max-w-lg mx-auto mb-8">
                        Find the perfect project matching your skills and earn while gaining real-world experience.
                    </p>

                    {/* Search bar */}
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white z-10" />
                        <input
                            type="text"
                            placeholder="Search projects by title or keyword…"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        />
                        <button
                            onClick={() => { setCurrentPage(1); }}
                            className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer'>Search</button>
                    </div>
                </div>
            </section>

            {/* ── CATEGORY QUICK PILLS ── */}
            <section className="border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1); }}
                            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedCategory === cat.value
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                            {cat.label}
                        </button>
                    ))}

                    {/* Mobile filter toggle */}
                    <button
                        onClick={() => setMobileFilterOpen(true)}
                        className="ml-auto shrink-0 lg:hidden flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </section>

            {/* ── MOBILE FILTER DRAWER ── */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto shadow-2xl">
                        <button
                            onClick={() => setMobileFilterOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                        <FilterPanel />
                    </div>
                </div>
            )}

            {/* ── MAIN CONTENT ── */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex gap-8">

                    {/* ── SIDEBAR (desktop) ── */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* ── PROJECT GRID ── */}
                    <main className="flex-1 min-w-0">
                        {/* Results bar */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-gray-900 font-semibold">
                                    {filteredProjects.length}{' '}
                                    <span className="text-gray-400 font-normal">
                                        project{filteredProjects.length !== 1 ? 's' : ''} found
                                    </span>
                                </p>
                                {activeFilterCount > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedCategory !== 'all' && (
                                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                                                {categories.find(c => c.value === selectedCategory)?.label}
                                                <button onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        )}
                                        {budgetRanges.map(r => (
                                            <span key={r} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                                                {budgetOptions.find(o => o.value === r)?.label}
                                                <button onClick={() => toggle(setBudgetRanges)(r)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {deadlineRanges.map(r => (
                                            <span key={r} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                                                {deadlineOptions.find(o => o.value === r)?.label}
                                                <button onClick={() => toggle(setDeadlineRanges)(r)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                        {selectedSkills.map(s => (
                                            <span key={s} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">
                                                {s}
                                                <button onClick={() => toggle(setSelectedSkills)(s)}>
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cards */}
                        {currentProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {currentProjects.map(project => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                                    <Search className="w-7 h-7 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                                    Try adjusting your filters or search query to find more projects.
                                </p>
                                <button
                                    onClick={clearAll}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* ── PAGINATION ── */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-1.5 mt-10">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-medium transition-all ${currentPage === 1
                                            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 rounded-xl border text-sm font-medium transition-all ${currentPage === page
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                                                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`w-9 h-9 rounded-xl border flex items-center justify-center text-sm font-medium transition-all ${currentPage === totalPages
                                            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                            : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ── CTA BANNER ── */}
            <section className="py-16 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden mt-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold text-white mb-3">Can't find the right project?</h2>
                    <p className="text-slate-400 mb-6 text-sm">Set up job alerts and we'll notify you the moment a matching project is posted.</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all">
                            Set Up Job Alert <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-medium text-sm transition-all">
                            Browse by Category
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}