import {
  ChevronDown, ChevronUp, Clock, DollarSign,
  Search, SortAsc, Tag, X, SlidersHorizontal,
  Briefcase, ArrowRight, CalendarDays
} from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useContext } from 'react';

// ── Data ─────────────────────────────────────────────────────────────────────
const budgetOptions = [
  { label: '$0 – $500', value: '0-500', min: 0, max: 500 },
  { label: '$500 – $1,000', value: '500-1000', min: 500, max: 1000 },
  { label: '$1,000 – $2,000', value: '1000-2000', min: 1000, max: 2000 },
  { label: '$2,000+', value: '2000-999999', min: 2000, max: 999999 },
];

const deadlineOptions = [
  { label: 'Past deadline', value: '-3650--1', min: -3650, max: -1 },
  { label: 'Due today', value: '0-0', min: 0, max: 0 },
  { label: 'Under 1 week', value: '1-7', min: 1, max: 7 },
  { label: '1–2 weeks', value: '8-14', min: 8, max: 14 },
  { label: '2–4 weeks', value: '15-30', min: 15, max: 30 },
  { label: '1+ month', value: '31-999', min: 31, max: 999 },
];


// ── Category colour map ───────────────────────────────────────────────────────
const catColor = {
  'Web Development': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Machine Learning': 'bg-green-500/10 text-green-400 border-green-500/20',
  'UI/UX Designing': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Mobile Development': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Data Analysis': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Data Science': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'API Development': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getDaysUntilDeadline = (deadlineDate) => {
  if (!deadlineDate) return null;
  const end = new Date(deadlineDate);
  if (Number.isNaN(end.getTime())) return null;

  const now = new Date();
  const ms = end.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const formatDeadlineLabel = (deadlineDate) => {
  if (!deadlineDate) return 'No deadline';

  const date = new Date(deadlineDate);
  if (Number.isNaN(date.getTime())) return 'Invalid deadline';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ── Collapsible filter section ────────────────────────────────────────────────
const FilterSection = ({ icon: Icon, title, expanded, onToggle, children }) => (
  <div className='border-b border-slate-700/50 pb-4'>
    <button
      onClick={onToggle}
      className='flex items-center justify-between w-full mb-3 text-slate-400 hover:text-white transition-colors'
    >
      <span className='flex items-center gap-2 text-sm font-medium'>
        {Icon && <Icon className='w-3.5 h-3.5' />}
        {title}
      </span>
      {expanded
        ? <ChevronUp className='w-3.5 h-3.5' />
        : <ChevronDown className='w-3.5 h-3.5' />}
    </button>
    {expanded && <div>{children}</div>}
  </div>
);

// ── Project card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const cc = catColor[project.category] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const daysUntilDeadline = getDaysUntilDeadline(project.deadline);

  const deadlineMeta =
    daysUntilDeadline === null
      ? 'No deadline'
      : daysUntilDeadline < 0
        ? `${Math.abs(daysUntilDeadline)} day${Math.abs(daysUntilDeadline) === 1 ? '' : 's'} overdue`
        : daysUntilDeadline === 0
          ? 'Due today'
          : `${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'} left`;

  return (
    <div
      onClick={() => navigate(`/apply-project/${project._id}`)}
      className='bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/50 transition-all duration-300 cursor-pointer group flex flex-col gap-3'
    >
      {/* Top row */}
      <div className='flex items-start justify-between gap-2'>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cc} shrink-0`}>
          {project.category}
        </span>
        <span className='text-xs text-slate-500'>
          Posted {new Date(project.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Title */}
      <h3 className='text-sm font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug'>
        {project.title}
      </h3>

      {project.recruiter?.companyName && (
        <p className='text-xs text-slate-500'>
          {project.recruiter.companyName}
        </p>
      )}

      {/* Description */}
      <p className='text-xs text-slate-500 leading-relaxed line-clamp-2'>{project.description}</p>

      {/* Skills */}
      <div className='flex flex-wrap gap-1.5'>
        {(project.technologies || []).slice(0, 3).map((skill, index) => (
            <span className='text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700/50' key={index}>{skill}</span>
          ))}
          {(project.technologies || []).length > 3 && (
            <span className='text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md border border-slate-700/50' >+{project.technologies.length - 3}</span>
          )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between pt-3 border-t border-slate-800 mt-auto'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1'>
            <DollarSign className='w-3.5 h-3.5 text-green-400' />
            <span className='text-sm font-bold text-green-400'>${Number(project.budget || 0).toLocaleString()}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Clock className='w-3.5 h-3.5 text-slate-500' />
            <span className='text-xs text-slate-500'>{deadlineMeta}</span>
          </div>
          <div className='flex items-center gap-1'>
            <CalendarDays className='w-3.5 h-3.5 text-slate-500' />
            <span className='text-xs text-slate-500'>{formatDeadlineLabel(project.deadline)}</span>
          </div>
        </div>
        <span className='text-xs text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          View <ArrowRight className='w-3 h-3' />
        </span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const BrowseProjects = () => {
  const { projects = [] } = useContext(AppContext);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [budgetExpanded, setBudgetExpanded] = useState(true);
  const [deadlineExpanded, setDeadlineExpanded] = useState(true);
  const [skillsExpanded, setSkillsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [budgetRanges, setBudgetRanges] = useState([]);
  const [deadlineRanges, setDeadlineRanges] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const categoryOptions = useMemo(() => {
    const uniqueCategories = [...new Set(projects.map((project) => project?.category?.trim()).filter(Boolean))];
    return [{ label: 'All Categories', value: 'all' }, ...uniqueCategories.map((category) => ({
      label: category,
      value: category.toLowerCase(),
    }))];
  }, [projects]);

  const allSkills = useMemo(() => {
    return [...new Set(
      projects
        .flatMap((project) => (Array.isArray(project?.technologies) ? project.technologies : []))
        .map((skill) => skill.trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  // ── Toggle handlers (unchanged logic) ──
  const handleBudgetToggle = v => setBudgetRanges(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const handleDeadlineToggle = v => setDeadlineRanges(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);
  const handleSkillToggle = v => setSelectedSkills(p => p.includes(v) ? p.filter(x => x !== v) : [...p, v]);

  const clearAll = () => {
    setSelectedCategory('all');
    setBudgetRanges([]);
    setDeadlineRanges([]);
    setSelectedSkills([]);
    setSearchTerm('');
  };

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    budgetRanges.length + deadlineRanges.length + selectedSkills.length;

  // ── Filter + sort (unchanged logic) ──
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        if (!project) return false;

        if (
          selectedCategory !== 'all' &&
          (project.category || '').toLowerCase() !== selectedCategory.toLowerCase()
        ) return false;

        if (budgetRanges.length > 0) {
          const budget = Number(project.budget || 0);
          const inBudget = budgetRanges.some((range) => {
            const [min, max] = range.split('-').map(Number);
            return budget >= min && budget <= max;
          });
          if (!inBudget) return false;
        }

        if (deadlineRanges.length > 0) {
          const days = getDaysUntilDeadline(project.deadline);
          if (days === null) return false;

          const inDeadline = deadlineRanges.some((range) => {
            const [min, max] = range.split('-').map(Number);
            return days >= min && days <= max;
          });
          if (!inDeadline) return false;
        }

        if (selectedSkills.length > 0) {
          const technologies = Array.isArray(project.technologies) ? project.technologies : [];
          if (!selectedSkills.some((skill) => technologies.includes(skill))) return false;
        }

        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          const technologies = Array.isArray(project.technologies) ? project.technologies : [];
          const requirements = Array.isArray(project.requirements) ? project.requirements : [];

          const searchable = [
            project.title,
            project.description,
            project.category,
            project.recruiter?.name,
            project.recruiter?.companyName,
            ...technologies,
            ...requirements,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!searchable.includes(q)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'budget_low') return Number(a.budget || 0) - Number(b.budget || 0);
        if (sortBy === 'budget_high') return Number(b.budget || 0) - Number(a.budget || 0);
        return 0;
      });
  }, [projects, selectedCategory, budgetRanges, deadlineRanges, selectedSkills, searchTerm, sortBy]);

  // ── Checkbox style helper ──
  const cbClass = 'w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer bg-slate-700 border-slate-600';

  return (
    <div className='min-h-screen'>

      {/* ── Page header ── */}
      <div className='mb-6'>
        <p className='text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1'>Opportunities</p>
        <h1 className='text-3xl font-bold text-white mb-1'>Browse Projects</h1>
        <p className='text-slate-500 text-sm'>Find your next opportunity from {projects.length} available projects</p>
      </div>

      {/* ── Search + sort bar ── */}
      <div className='flex gap-3 mb-6'>
        <div className='relative flex-1'>
          <Search className='w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2' />
          <input
            type='text'
            placeholder='Search by title, category, technology, recruiter…'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white'>
              <X className='w-4 h-4' />
            </button>
          )}
        </div>

        <div className='relative'>
          <SortAsc className='w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none' />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className='pl-9 pr-4 py-2.5 bg-slate-900 border border-blue-500/40 text-blue-400 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
          >
            <option value='newest'>Newest First</option>
            <option value='oldest'>Oldest First</option>
            <option value='budget_high'>Highest Budget</option>
            <option value='budget_low'>Lowest Budget</option>
          </select>
        </div>
      </div>

      {/* ── Active filter chips ── */}
      {activeFilterCount > 0 && (
        <div className='flex flex-wrap gap-2 mb-5'>
          {selectedCategory !== 'all' && (
            <span className='flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full'>
              {categoryOptions.find(c => c.value === selectedCategory)?.label}
              <button onClick={() => setSelectedCategory('all')}><X className='w-3 h-3' /></button>
            </span>
          )}
          {budgetRanges.map(v => (
            <span key={v} className='flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full'>
              {budgetOptions.find(o => o.value === v)?.label}
              <button onClick={() => handleBudgetToggle(v)}><X className='w-3 h-3' /></button>
            </span>
          ))}
          {deadlineRanges.map(v => (
            <span key={v} className='flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full'>
              {deadlineOptions.find(o => o.value === v)?.label}
              <button onClick={() => handleDeadlineToggle(v)}><X className='w-3 h-3' /></button>
            </span>
          ))}
          {selectedSkills.map(s => (
            <span key={s} className='flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full'>
              {s}
              <button onClick={() => handleSkillToggle(s)}><X className='w-3 h-3' /></button>
            </span>
          ))}
          <button onClick={clearAll} className='text-xs text-slate-500 hover:text-white transition-colors px-2'>
            Clear all
          </button>
        </div>
      )}

      <div className='flex gap-5'>

        {/* ── Sidebar filters ── */}
        <aside className='w-56 shrink-0'>
          <div className='bg-slate-900 border border-slate-800 rounded-2xl p-5 sticky top-6'>
            <div className='flex items-center justify-between mb-5'>
              <div className='flex items-center gap-2'>
                <SlidersHorizontal className='w-4 h-4 text-blue-400' />
                <h4 className='text-sm font-semibold text-white'>Filters</h4>
              </div>
              {activeFilterCount > 0 && (
                <span className='text-xs bg-blue-600 text-white font-semibold px-1.5 py-0.5 rounded-full'>
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className='space-y-4'>

              {/* Category */}
              <FilterSection icon={Tag} title='Category' expanded={categoryExpanded} onToggle={() => setCategoryExpanded(v => !v)}>
                <div className='space-y-2'>
                  {categoryOptions.map(cat => (
                    <label key={cat.value} className='flex items-center gap-2.5 cursor-pointer group'>
                      <input
                        type='radio'
                        name='category'
                        value={cat.value}
                        checked={selectedCategory === cat.value}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className={cbClass}
                      />
                      <span className={`text-xs transition-colors ${selectedCategory === cat.value ? 'text-blue-400 font-medium' : 'text-slate-400 group-hover:text-white'}`}>
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Budget */}
              <FilterSection icon={DollarSign} title='Budget Range' expanded={budgetExpanded} onToggle={() => setBudgetExpanded(v => !v)}>
                <div className='space-y-2'>
                  {budgetOptions.map(opt => (
                    <label key={opt.value} className='flex items-center gap-2.5 cursor-pointer group'>
                      <input
                        type='checkbox'
                        value={opt.value}
                        checked={budgetRanges.includes(opt.value)}
                        onChange={() => handleBudgetToggle(opt.value)}
                        className={cbClass}
                      />
                      <span className={`text-xs transition-colors ${budgetRanges.includes(opt.value) ? 'text-blue-400 font-medium' : 'text-slate-400 group-hover:text-white'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Deadline */}
              <FilterSection icon={Clock} title='Deadline' expanded={deadlineExpanded} onToggle={() => setDeadlineExpanded(v => !v)}>
                <div className='space-y-2'>
                  {deadlineOptions.map(opt => (
                    <label key={opt.value} className='flex items-center gap-2.5 cursor-pointer group'>
                      <input
                        type='checkbox'
                        value={opt.value}
                        checked={deadlineRanges.includes(opt.value)}
                        onChange={() => handleDeadlineToggle(opt.value)}
                        className={cbClass}
                      />
                      <span className={`text-xs transition-colors ${deadlineRanges.includes(opt.value) ? 'text-blue-400 font-medium' : 'text-slate-400 group-hover:text-white'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Skills */}
              <FilterSection title='Required Skills' expanded={skillsExpanded} onToggle={() => setSkillsExpanded(v => !v)}>
                <div className='space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin'>
                  {allSkills.map(skill => (
                    <label key={skill} className='flex items-center gap-2.5 cursor-pointer group'>
                      <input
                        type='checkbox'
                        value={skill}
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className={cbClass}
                      />
                      <span className={`text-xs transition-colors ${selectedSkills.includes(skill) ? 'text-blue-400 font-medium' : 'text-slate-400 group-hover:text-white'}`}>
                        {skill}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

            </div>
          </div>
        </aside>

        {/* ── Project grid ── */}
        <div className='flex-1 min-w-0'>
          {/* Result count */}
          <div className='flex items-center justify-between mb-4'>
            <p className='text-sm text-slate-500'>
              <span className='text-white font-semibold'>{filteredProjects.length}</span> projects found
            </p>
          </div>

          {filteredProjects.length > 0 ? (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              {filteredProjects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-24 text-center'>
              <div className='w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4'>
                <Briefcase className='w-7 h-7 text-slate-600' />
              </div>
              <h3 className='text-white font-semibold mb-2'>No projects found</h3>
              <p className='text-slate-500 text-sm mb-5'>Try adjusting your filters or search term</p>
              <button
                onClick={clearAll}
                className='text-sm text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-500/10 transition-colors'
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BrowseProjects;