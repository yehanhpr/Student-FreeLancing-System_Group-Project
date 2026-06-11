import { Calendar, CheckCircle, DollarSign, Plus, Tag, X, Briefcase, FileText, Package } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'

// ── Static data (unchanged) ───────────────────────────────────────────────────
const categories = [
  'Web Development', 'Machine Learning', 'UI/UX Design', 'Mobile Development', 'Data Science', 'API Development', 'Game Development', 'DevOps', 'Cybersecurity', 'Cloud Computing', 'Blockchain', 'Other'
]

const suggestedTechnologies = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'Node.js',
  'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
  'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP',
  'MongoDB', 'PostgreSQL', 'MySQL', 'GCP', 'Git',
]

// ── Shared field wrapper ──────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{children}</p>
)

const inputCls = "w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-400" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
)

const fmt = dateStr => new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

// ── Main Component ────────────────────────────────────────────────────────────
const CreateProject = () => {
  const { projectId } = useParams()
  const isEditMode = !!projectId

  const navigate = useNavigate();
  const { token } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    budget: '',
    deadline: '',
    technologies: [],
    requirements: [],
    deliverables: []
  })

  const [techInput, setTechInput] = useState('')
  const [currentRequirement, setCurrentRequirement] = useState('')
  const [currentDeliverable, setCurrentDeliverable] = useState('')

  // ── Add / Remove helpers (unchanged logic) ──
  const addRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(p => ({ ...p, requirements: [...p.requirements, currentRequirement.trim()] }))
      setCurrentRequirement('')
    }
  }
  const removeRequirement = i => setFormData(p => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) }))

  const addDeliverable = () => {
    if (currentDeliverable.trim()) {
      setFormData(p => ({ ...p, deliverables: [...p.deliverables, currentDeliverable.trim()] }))
      setCurrentDeliverable('')
    }
  }
  const removeDeliverable = i => setFormData(p => ({ ...p, deliverables: p.deliverables.filter((_, idx) => idx !== i) }))

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/projects/project/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      console.log('Fetched project details:', data)
      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to load project details.');
        return;
      }

      const project = data.project
      setFormData({
        title: project.title || '',
        category: project.category || '',
        description: project.description || '',
        budget: project.budget?.toString() || '',
        deadline: fmt(project.deadline) || '',
        technologies: project.technologies || [],
        requirements: project.requirements || [],
        deliverables: project.deliverables || []
      })
    } catch (error) {
      toast.error('Failed to load project details.');
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isEditMode) return
    fetchProjectDetails();
  }, [projectId, isEditMode, token])

  // ── Tech chip click (unchanged logic) ──
  const handleTechSuggestion = (tech) => {
    setFormData(prev => {
      if (prev.technologies.includes(tech)) return prev
      const updated = [...prev.technologies, tech]
      setTechInput(updated.join(', '))
      return { ...prev, technologies: updated }
    })
  }

  // ── Tech input blur (unchanged logic) ──
  const handleTechBlur = () => {
    const techArray = techInput.split(',').map(t => t.trim()).filter(Boolean)
    setFormData(p => ({ ...p, technologies: techArray }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanTechnologies = techInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      budget: Number(formData.budget),
      deadline: formData.deadline,
      technologies: cleanTechnologies,
      requirements: formData.requirements.map(r => r.trim()).filter(Boolean),
      deliverables: formData.deliverables.map(d => d.trim()).filter(Boolean)
    }

    if (!payload.title || !payload.category || !payload.description || !payload.budget || !payload.deadline || payload.technologies.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (payload.requirements.length === 0) {
      toast.error('Please add at least one requirement.');
      return;
    }

    if (payload.deliverables.length === 0) {
      toast.error('Please add at least one deliverable.');
      return;
    }

    try {
      setLoading(true);

      const endpoint = isEditMode ? `${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/update-project/${projectId}` : `${import.meta.env.VITE_REACT_BACKEND_URL}/api/recruiter/create-project`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || 'An error occurred while saving the project.');
        return;
      }

      toast.success(isEditMode ? 'Project updated successfully!' : 'Project created successfully!');
      navigate('/owner-dashboard/projects');

    } catch (error) {
      toast.error('An error occurred while saving the project.');
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <div className="mb-6">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">
          {isEditMode ? 'Edit' : 'New'}
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">
          {isEditMode ? 'Edit Project' : 'Create New Project'}
        </h1>
        <p className="text-slate-500 text-sm">
          {isEditMode ? 'Update your project details below.' : 'Post a new micro-project and find talented students.'}
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

        {/* ── Project Details ── */}
        <SectionCard icon={Briefcase} title="Project Details">
          <div className="flex flex-col gap-4">

            {/* Title */}
            <div>
              <FieldLabel>Project Title</FieldLabel>
              <input type="text" placeholder="e.g., React Dashboard Development"
                className={inputCls}
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            {/* Category */}
            <div>
              <FieldLabel>Category</FieldLabel>
              <select
                className={`${inputCls} appearance-none cursor-pointer`}
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                required
              >
                <option value="" className="bg-slate-800">Select a category</option>
                {categories.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
              </select>
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Project Description</FieldLabel>
              <textarea
                placeholder="Describe your project in detail…"
                rows={5}
                className={`${inputCls} resize-none`}
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                required
              />
            </div>

            {/* Budget + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Budget (USD)</FieldLabel>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="number" placeholder="500"
                    className={`${inputCls} pl-9`}
                    value={formData.budget}
                    onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <FieldLabel>Deadline</FieldLabel>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="date"
                    className={`${inputCls} pl-9`}
                    value={formData.deadline}
                    onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Technologies ── */}
        <SectionCard icon={Tag} title="Technologies">
          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>Technologies (comma-separated)</FieldLabel>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="React, TypeScript, Tailwind CSS"
                  className={`${inputCls} pl-9`}
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onBlur={handleTechBlur}
                  required
                />
              </div>
            </div>

            {/* Selected tech chips */}
            {formData.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-xl font-medium">
                    {t}
                    <button type="button"
                      onClick={() => {
                        const updated = formData.technologies.filter((_, idx) => idx !== i)
                        setFormData(p => ({ ...p, technologies: updated }))
                        setTechInput(updated.join(', '))
                      }}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggestions */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Suggested Technologies:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTechnologies.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => handleTechSuggestion(tech)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${formData.technologies.includes(tech)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-700 text-slate-400 hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5'
                      }`}
                  >
                    {formData.technologies.includes(tech) ? `✓ ${tech}` : `+ ${tech}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Requirements ── */}
        <SectionCard icon={FileText} title="Project Requirements">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Experience with React and TypeScript"
              className={`${inputCls} flex-1`}
              value={currentRequirement}
              onChange={e => setCurrentRequirement(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRequirement() } }}
            />
            <button type="button" onClick={addRequirement}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {formData.requirements.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Added Requirements</p>
              <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                {formData.requirements.map((req, i) => (
                  <li key={i} className="flex items-center justify-between bg-orange-500/5 border border-orange-500/20 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full shrink-0" />
                      <p className="text-sm text-orange-300">{req}</p>
                    </div>
                    <button type="button" onClick={() => removeRequirement(i)}
                      className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer ml-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* ── Deliverables ── */}
        <SectionCard icon={Package} title="Deliverables">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g., Fully responsive dashboard with documentation"
              className={`${inputCls} flex-1`}
              value={currentDeliverable}
              onChange={e => setCurrentDeliverable(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable() } }}
            />
            <button type="button" onClick={addDeliverable}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {formData.deliverables.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Added Deliverables</p>
              <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                {formData.deliverables.map((del, i) => (
                  <li key={i} className="flex items-center justify-between bg-purple-500/5 border border-purple-500/20 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0" />
                      <p className="text-sm text-purple-300">{del}</p>
                    </div>
                    <button type="button" onClick={() => removeDeliverable(i)}
                      className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer ml-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </SectionCard>

        {/* ── Project Preview ── */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Project Preview</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Title', value: formData.title },
              { label: 'Category', value: formData.category },
              { label: 'Budget', value: formData.budget ? `$${formData.budget}` : '' },
              { label: 'Deadline', value: fmt(formData.deadline) },
              { label: 'Technologies', value: formData.technologies.length > 0 ? formData.technologies.join(', ') : '' },
              { label: 'Requirements', value: `${formData.requirements.length} added` },
              { label: 'Deliverables', value: `${formData.deliverables.length} added` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={`text-sm font-medium truncate ${value ? 'text-white' : 'text-slate-600 italic'}`}>
                  {value || 'Not specified'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pb-4">
          <button type="button"
            className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-medium transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button type="submit"
            disabled={loading}
            className={`flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (isEditMode ? 'Updating Project...' : 'Posting Project...') : (isEditMode ? 'Update Project' : 'Post Project')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProject