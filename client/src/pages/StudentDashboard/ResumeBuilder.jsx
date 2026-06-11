import {
    Award, Briefcase, Download, FileText, GraduationCap,
    Loader2, Mail, MapPin, Phone, Plus, Sparkles, Trash2, User, X
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Document, Packer, Paragraph, TextRun, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 8);

const enhanceWithAI = async (currentValue) => {

    if (!currentValue?.trim()) {
        return currentValue;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/enhance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ currentValue: currentValue.trim() })
        });
        const data = await response.json();

        if (!response.ok) {
            toast.error(data.error || 'Failed to enhance the field. Please try again.');
            return currentValue;
        }

        return data.enhancedValue;
    } catch (error) {
        console.error('Error enhancing field:', error);
        return currentValue;
    }
};

// ── Sub-components (defined OUTSIDE to avoid re-mount on re-render) ───────────
const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
            <Icon className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
    </div>
);

const Field = ({ label, value, onChange, placeholder, multiline }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
        {multiline
            ? <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            : <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        }
    </div>
);

const EnhanceBtn = ({ loading, onClick }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
    >
        {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? 'Enhancing…' : 'Enhance with AI'}
    </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ResumeBuilder = () => {

    const [personal, setPersonal] = useState({
        name: '', title: '', email: '', phone: '', location: '', summary: ''
    });
    const [experiences, setExperiences] = useState([
        { id: uid(), role: '', company: '', period: '', description: '' }
    ]);
    const [education, setEducation] = useState([
        { id: uid(), degree: '', institution: '', period: '', gpa: '' }
    ]);
    const [skills, setSkills] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [aiLoading, setAiLoading] = useState({});

    const setLoading = (key, val) => setAiLoading(p => ({ ...p, [key]: val }));

    // ── AI handlers ──
    const enhanceField = async (key, value, setter) => {
        if (!value.trim()) return;
        setLoading(key, true);
        try { setter(await enhanceWithAI(value)); }
        finally { setLoading(key, false); }
    };

    const enhanceExpDesc = async (id, value) => {
        if (!value.trim()) return;
        setLoading(`exp-${id}`, true);
        try {
            const enhanced = await enhanceWithAI(value);
            setExperiences(prev => prev.map(e => e.id === id ? { ...e, description: enhanced } : e));
        } finally { setLoading(`exp-${id}`, false); }
    };

    // ── Experience helpers ──
    const addExp = () => setExperiences(p => [...p, { id: uid(), role: '', company: '', period: '', description: '' }]);
    const removeExp = id => setExperiences(p => p.filter(e => e.id !== id));
    const updateExp = (id, field, val) => setExperiences(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

    // ── Education helpers ──
    const addEdu = () => setEducation(p => [...p, { id: uid(), degree: '', institution: '', period: '', gpa: '' }]);
    const removeEdu = id => setEducation(p => p.filter(e => e.id !== id));
    const updateEdu = (id, field, val) => setEducation(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

    // ── Skills helpers ──
    const addSkill = () => {
        const t = skillInput.trim();
        if (t && !skills.includes(t)) { setSkills(p => [...p.filter(Boolean), t]); setSkillInput(''); }
    };
    const removeSkill = s => setSkills(p => p.filter(x => x !== s));

    // ── Download ──
    const previewRef = useRef(null);

    const handleDownload = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({ children: [new TextRun({ text: personal.name || 'Your Name', bold: true, size: 48, color: '1a1a2e' })] }),
                    new Paragraph({ children: [new TextRun({ text: personal.title || '', size: 24, color: '2563eb' })], spacing: { after: 100 } }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: personal.email, size: 18, color: '555555' }),
                            new TextRun({ text: personal.phone ? `  |  ${personal.phone}` : '', size: 18, color: '555555' }),
                            new TextRun({ text: personal.location ? `  |  ${personal.location}` : '', size: 18, color: '555555' }),
                        ],
                        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563eb' } },
                        spacing: { after: 200 }
                    }),
                    ...(personal.summary ? [
                        new Paragraph({ children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, color: '2563eb', size: 22 })], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'dbeafe' } }, spacing: { after: 100 } }),
                        new Paragraph({ children: [new TextRun({ text: personal.summary, size: 20, color: '444444' })], spacing: { after: 200 } }),
                    ] : []),
                    ...(experiences.some(e => e.role || e.company) ? [
                        new Paragraph({ children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, color: '2563eb', size: 22 })], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'dbeafe' } }, spacing: { after: 120 } }),
                        ...experiences.flatMap(exp => (exp.role || exp.company) ? [
                            new Paragraph({ children: [new TextRun({ text: exp.role, bold: true, size: 22 }), new TextRun({ text: exp.period ? `   ${exp.period}` : '', size: 18, color: '888888' })], spacing: { after: 60 } }),
                            new Paragraph({ children: [new TextRun({ text: exp.company, size: 20, color: '555555', italics: true })], spacing: { after: 60 } }),
                            ...(exp.description ? [new Paragraph({ children: [new TextRun({ text: exp.description, size: 19, color: '444444' })], spacing: { after: 160 } })] : [])
                        ] : [])
                    ] : []),
                    ...(education.some(e => e.degree || e.institution) ? [
                        new Paragraph({ children: [new TextRun({ text: 'EDUCATION', bold: true, color: '2563eb', size: 22 })], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'dbeafe' } }, spacing: { after: 120 } }),
                        ...education.flatMap(edu => (edu.degree || edu.institution) ? [
                            new Paragraph({ children: [new TextRun({ text: edu.degree, bold: true, size: 22 }), new TextRun({ text: edu.period ? `   ${edu.period}` : '', size: 18, color: '888888' })], spacing: { after: 60 } }),
                            new Paragraph({ children: [new TextRun({ text: edu.institution, size: 20, color: '555555', italics: true }), new TextRun({ text: edu.gpa ? `   GPA: ${edu.gpa}` : '', size: 19, color: '666666' })], spacing: { after: 160 } }),
                        ] : [])
                    ] : []),
                    ...(skills.filter(Boolean).length > 0 ? [
                        new Paragraph({ children: [new TextRun({ text: 'SKILLS', bold: true, color: '2563eb', size: 22 })], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'dbeafe' } }, spacing: { after: 120 } }),
                        new Paragraph({ children: [new TextRun({ text: skills.filter(Boolean).join('  •  '), size: 20, color: '1d4ed8' })], spacing: { after: 200 } }),
                    ] : []),
                ]
            }]
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${personal.name || 'Resume'}.docx`);
    };

    return (
        <div className="min-h-screen">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center rounded-xl">
                        <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-0.5">Builder</p>
                        <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Download .docx
                </button>
            </div>

            <div className="grid grid-cols-2 gap-5 items-start">

                {/* ── LEFT: Editor ── */}
                <div className="col-span-1 flex flex-col gap-4">

                    {/* Personal Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <SectionHeader icon={User} title="Personal Information" />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Full Name" value={personal.name} onChange={v => setPersonal(p => ({ ...p, name: v }))} placeholder="Ravindu Sachintha" />
                            <Field label="Job Title" value={personal.title} onChange={v => setPersonal(p => ({ ...p, title: v }))} placeholder="Full Stack Developer" />
                            <Field label="Email" value={personal.email} onChange={v => setPersonal(p => ({ ...p, email: v }))} placeholder="ravindu@email.com" />
                            <Field label="Phone" value={personal.phone} onChange={v => setPersonal(p => ({ ...p, phone: v }))} placeholder="+94 700 000 000" />
                            <div className="col-span-2">
                                <Field label="Location" value={personal.location} onChange={v => setPersonal(p => ({ ...p, location: v }))} placeholder="Colombo, Sri Lanka" />
                            </div>
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Professional Summary</label>
                                    <EnhanceBtn
                                        loading={aiLoading['summary']}
                                        onClick={() => enhanceField('summary', personal.summary, v => setPersonal(p => ({ ...p, summary: v })))}
                                    />
                                </div>
                                <textarea
                                    value={personal.summary}
                                    onChange={e => setPersonal(p => ({ ...p, summary: e.target.value }))}
                                    placeholder="Brief overview of your professional background…"
                                    rows={3}
                                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <SectionHeader icon={Briefcase} title="Work Experience" />
                        <div className="flex flex-col gap-4">
                            {experiences.map(exp => (
                                <div key={exp.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 relative">
                                    {experiences.length > 1 && (
                                        <button
                                            onClick={() => removeExp(exp.id)}
                                            className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Job Title" value={exp.role} onChange={v => updateExp(exp.id, 'role', v)} placeholder="Frontend Developer" />
                                        <Field label="Company" value={exp.company} onChange={v => updateExp(exp.id, 'company', v)} placeholder="TechCorp Inc." />
                                        <div className="col-span-2">
                                            <Field label="Period" value={exp.period} onChange={v => updateExp(exp.id, 'period', v)} placeholder="Jan 2024 – Present" />
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</label>
                                                <EnhanceBtn
                                                    loading={aiLoading[`exp-${exp.id}`]}
                                                    onClick={() => enhanceExpDesc(exp.id, exp.description)}
                                                />
                                            </div>
                                            <textarea
                                                value={exp.description}
                                                onChange={e => updateExp(exp.id, 'description', e.target.value)}
                                                placeholder="Describe your responsibilities and achievements…"
                                                rows={3}
                                                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addExp}
                                className="flex items-center gap-2 text-sm text-blue-400 border border-dashed border-blue-500/30 rounded-xl py-2.5 justify-center hover:bg-blue-500/5 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Experience
                            </button>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <SectionHeader icon={GraduationCap} title="Education" />
                        <div className="flex flex-col gap-4">
                            {education.map(edu => (
                                <div key={edu.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 relative">
                                    {education.length > 1 && (
                                        <button
                                            onClick={() => removeEdu(edu.id)}
                                            className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Degree" value={edu.degree} onChange={v => updateEdu(edu.id, 'degree', v)} placeholder="B.Sc. Computer Science" />
                                        <Field label="Institution" value={edu.institution} onChange={v => updateEdu(edu.id, 'institution', v)} placeholder="University of Moratuwa" />
                                        <Field label="Period" value={edu.period} onChange={v => updateEdu(edu.id, 'period', v)} placeholder="2020 – 2024" />
                                        <Field label="GPA (optional)" value={edu.gpa} onChange={v => updateEdu(edu.id, 'gpa', v)} placeholder="3.9 / 4.0" />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addEdu}
                                className="flex items-center gap-2 text-sm text-blue-400 border border-dashed border-blue-500/30 rounded-xl py-2.5 justify-center hover:bg-blue-500/5 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Education
                            </button>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <SectionHeader icon={Award} title="Skills" />
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={e => setSkillInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addSkill()}
                                placeholder="Type a skill and press Enter…"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button
                                onClick={addSkill}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.filter(Boolean).map(skill => (
                                <span key={skill} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-xl text-xs font-medium">
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors cursor-pointer">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {skills.filter(Boolean).length === 0 && (
                                <p className="text-xs text-slate-600 italic">No skills added yet — type above and press Enter</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Live Preview ── */}
                <div className="col-span-1 sticky top-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                        {/* Preview header bar */}
                        <div className="flex items-center justify-between px-5 py-3 bg-blue-600 border-b border-blue-700">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-200 opacity-80" />
                                <span className="text-white text-sm font-medium">Live Preview</span>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium border border-white/20"
                            >
                                <Download className="w-3.5 h-3.5" /> Download
                            </button>
                        </div>

                        {/* White resume canvas */}
                        <div
                            ref={previewRef}
                            className="p-8 bg-white text-gray-800 text-sm leading-relaxed"
                            style={{ fontFamily: 'Georgia, serif' }}
                        >
                            {/* Header */}
                            <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                                    {personal.name || 'Your Name'}
                                </h1>
                                <p style={{ color: '#2563eb', marginTop: '4px', fontSize: '0.95rem', margin: '4px 0 0' }}>
                                    {personal.title || 'Your Job Title'}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.78rem', color: '#555', flexWrap: 'wrap' }}>
                                    {personal.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail style={{ width: '12px', height: '12px' }} />{personal.email}</span>}
                                    {personal.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone style={{ width: '12px', height: '12px' }} />{personal.phone}</span>}
                                    {personal.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin style={{ width: '12px', height: '12px' }} />{personal.location}</span>}
                                </div>
                            </div>

                            {/* Summary */}
                            {personal.summary && (
                                <div style={{ marginBottom: '18px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: '3px', marginBottom: '8px' }}>
                                        Professional Summary
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: '#444', lineHeight: 1.6 }}>{personal.summary}</p>
                                </div>
                            )}

                            {/* Experience */}
                            {experiences.some(e => e.role || e.company) && (
                                <div style={{ marginBottom: '18px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: '3px', marginBottom: '10px' }}>
                                        Work Experience
                                    </p>
                                    {experiences.map(exp => (exp.role || exp.company) ? (
                                        <div key={exp.id} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{exp.role || '—'}</span>
                                                <span style={{ fontSize: '0.78rem', color: '#888' }}>{exp.period}</span>
                                            </div>
                                            <p style={{ color: '#555', fontSize: '0.82rem', margin: '2px 0 0' }}>{exp.company}</p>
                                            {exp.description && <p style={{ fontSize: '0.82rem', color: '#444', lineHeight: 1.6, marginTop: '3px' }}>{exp.description}</p>}
                                        </div>
                                    ) : null)}
                                </div>
                            )}

                            {/* Education */}
                            {education.some(e => e.degree || e.institution) && (
                                <div style={{ marginBottom: '18px' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: '3px', marginBottom: '10px' }}>
                                        Education
                                    </p>
                                    {education.map(edu => (edu.degree || edu.institution) ? (
                                        <div key={edu.id} style={{ marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{edu.degree || '—'}</span>
                                                <span style={{ fontSize: '0.78rem', color: '#888' }}>{edu.period}</span>
                                            </div>
                                            <p style={{ color: '#555', fontSize: '0.82rem', margin: '2px 0 0' }}>
                                                {edu.institution}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}
                                            </p>
                                        </div>
                                    ) : null)}
                                </div>
                            )}

                            {/* Skills */}
                            {skills.filter(Boolean).length > 0 && (
                                <div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', borderBottom: '1px solid #dbeafe', paddingBottom: '3px', marginBottom: '10px' }}>
                                        Skills
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {skills.filter(Boolean).map(s => (
                                            <span key={s} style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.78rem', padding: '2px 10px', borderRadius: '20px' }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {!personal.name && !personal.summary && !experiences.some(e => e.role) && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                                    <p style={{ fontSize: '0.85rem' }}>Start filling in the form to see your resume preview here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;