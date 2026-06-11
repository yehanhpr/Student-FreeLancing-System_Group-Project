import { Bell, CreditCard, Edit, FileText, SaveIcon, Shield, UploadIcon, User, X } from 'lucide-react'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const MAX_RESUME_SIZE = 5 * 1024 * 1024
const RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const getResumeNameFromUrl = (url = '') => {
  if (!url) return ''
  const cleanUrl = url.split('?')[0]
  return decodeURIComponent(cleanUrl.split('/').pop() || 'resume')
}

const MIME_TO_EXTENSION = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

const ensureFileNameWithExtension = (name = 'resume', mimeType = '') => {
  const cleaned = name || 'resume'
  if (cleaned.includes('.')) return cleaned
  const ext = MIME_TO_EXTENSION[mimeType]
  return ext ? `${cleaned}.${ext}` : cleaned
}

// ── Shared primitives (outside parent to avoid remount) ───────────────────────
const InputField = ({ label, value, onChange, disabled, type = 'text', placeholder = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${disabled
          ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
          : 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600'}`}
    />
  </div>
)

const Toggle = ({ checked, onChange, disabled }) => (
  <label className={`flex items-center ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
    <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${checked ? 'bg-blue-600' : 'bg-slate-700'}`}>
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  </label>
)

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-base font-semibold text-white">{title}</h2>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
)

const Divider = () => <div className="border-t border-slate-800 my-6" />

const FooterActions = ({ isEditing, isLoading, onEdit, onCancel, onSave, editLabel = 'Edit' }) => (
  <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
    {!isEditing ? (
      <button onClick={onEdit}
        className="flex items-center gap-2 text-sm text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-xl hover:bg-blue-500/10 transition-all cursor-pointer">
        <Edit className="w-4 h-4" /> {editLabel}
      </button>
    ) : (
      <>
        <button onClick={onCancel}
          className="flex items-center gap-2 text-sm text-slate-400 border border-slate-700 px-5 py-2.5 rounded-xl hover:border-slate-600 hover:text-white transition-all cursor-pointer">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={onSave}
          className={`flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl transition-colors cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}>
          <SaveIcon className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </>
    )}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Settings = () => {

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  const { token, user, setUser } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingNotifications, setIsEditingNotifications] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [resumeUrl, setResumeUrl] = useState(user?.resume || '')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const resumeInputRef = useRef(null)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    university: user?.university || '',
    major: user?.major || '',
    graduationYear: user?.graduationYear || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    portfolio: user?.portfolio || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    resume: user?.resume || '',
  })

  const [notifications, setNotifications] = useState({
    emailNewProjects: true, emailApplications: true, emailPayments: true, emailNDA: true,
    pushNewProjects: false, pushApplications: true, pushPayments: true, pushNDA: true,
  })

  const [tempProfileData, setTempProfileData] = useState(profileData)
  const [tempProfilePicture, setTempProfilePicture] = useState(profilePicture)
  const [tempResumeUrl, setTempResumeUrl] = useState(resumeUrl)
  const [tempNotificationData, setTempNotificationData] = useState(notifications)

  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedResumeFile, setSelectedResumeFile] = useState(null)
  const [isDownloadingResume, setIsDownloadingResume] = useState(false)

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('File size must be less than 2MB'); return }
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) { alert('Only JPG, PNG, or GIF files are allowed'); return }
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setTempProfilePicture(reader.result)
    reader.readAsDataURL(file)
  }

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!RESUME_MIME_TYPES.includes(file.type)) {
      toast.error('Only PDF, DOC, or DOCX files are allowed')
      return
    }

    if (file.size > MAX_RESUME_SIZE) {
      toast.error('Resume size must be less than 5MB')
      return
    }

    setSelectedResumeFile(file)
    setTempResumeUrl(file.name)
  }

  const handleViewResume = async () => {
    if (!tempResumeUrl || selectedResumeFile) return

    try {
      setIsDownloadingResume(true)
      const response = await fetch(tempResumeUrl)

      if (!response.ok) {
        throw new Error('Failed to fetch resume')
      }

      const blob = await response.blob()
      const safeName = ensureFileNameWithExtension(getResumeNameFromUrl(tempResumeUrl), blob.type)
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = safeName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      window.open(tempResumeUrl, '_blank', 'noopener,noreferrer')
      toast.error('Could not prepare file download. Opened resume in a new tab instead.')
    } finally {
      setIsDownloadingResume(false)
    }
  }

  // For profile editing
  const handleUpdateProfile = () => {
    setTempProfileData(profileData)
    setTempProfilePicture(profilePicture)
    setTempResumeUrl(resumeUrl)
    setSelectedFile(null)
    setSelectedResumeFile(null)
    setIsEditingProfile(true)
  }
  const handleCancelEdit = () => {
    setTempProfileData(profileData)
    setIsEditingProfile(false)
    setSelectedFile(null)
    setSelectedResumeFile(null)
    setTempProfilePicture(profilePicture)
    setTempResumeUrl(resumeUrl)
  }

  const handleSaveChanges = async () => {
    try {

      setLoading(true)

      const formData = new FormData();
      formData.append('name', tempProfileData.name);
      formData.append('email', tempProfileData.email);
      formData.append('phone', tempProfileData.phone);
      formData.append('university', tempProfileData.university);
      formData.append('major', tempProfileData.major);
      formData.append('graduationYear', tempProfileData.graduationYear);
      formData.append('bio', tempProfileData.bio);
      formData.append('skills', JSON.stringify(tempProfileData.skills));
      formData.append('portfolio', tempProfileData.portfolio);
      formData.append('linkedin', tempProfileData.linkedin);
      formData.append('github', tempProfileData.github);

      if (selectedFile) {
        formData.append('profilePicture', selectedFile);
      }

      if (selectedResumeFile) {
        formData.append('resume', selectedResumeFile);
      }

      const res = await fetch(`${import.meta.env.VITE_REACT_BACKEND_URL}/api/student/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to update profile');
        return;
      }

      const updatedProfile = data.student;

      const mappedProfile = {
        name: updatedProfile.name || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        university: updatedProfile.university || '',
        major: updatedProfile.major || '',
        graduationYear: updatedProfile.graduationYear || '',
        bio: updatedProfile.bio || '',
        skills: updatedProfile.skills || [],
        portfolio: updatedProfile.portfolio || '',
        linkedin: updatedProfile.linkedin || '',
        github: updatedProfile.github || '',
        resume: updatedProfile.resume || '',
      }

      setProfileData(mappedProfile);
      setTempProfileData(mappedProfile);
      setProfilePicture(updatedProfile.profilePicture || null);
      setTempProfilePicture(updatedProfile.profilePicture || null);
      setResumeUrl(updatedProfile.resume || '');
      setTempResumeUrl(updatedProfile.resume || '');
      setSelectedFile(null);
      setSelectedResumeFile(null);
      setIsEditingProfile(false);
      setUser(prev => ({ ...prev, ...mappedProfile }));

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  // For notifications
  const handleUpdateNotifications = () => setIsEditingNotifications(true)
  const handleSaveNotifications = () => { setNotifications(tempNotificationData); setIsEditingNotifications(false) }
  const handleCancelNotifications = () => { setTempNotificationData(notifications); setIsEditingNotifications(false) }

  const currentProfile = isEditingProfile ? tempProfileData : profileData
  const currentPhoto = isEditingProfile ? tempProfilePicture : profilePicture

  // ── Notification row data ─────────────────────────────────────────────────
  const emailRows = [
    { key: 'emailNewProjects', label: 'New Projects', desc: 'Get notified when new projects matching your skills are posted' },
    { key: 'emailApplications', label: 'Application Updates', desc: 'Receive updates on your project applications' },
    { key: 'emailPayments', label: 'Payment Updates', desc: 'Get notified about payments and earnings' },
    { key: 'emailNDA', label: 'NDA Requests', desc: 'Receive notifications for new NDA requests' },
  ]
  const pushRows = [
    { key: 'pushNewProjects', label: 'New Projects', desc: 'Browser notifications for new projects' },
    { key: 'pushApplications', label: 'Application Updates', desc: 'Browser notifications for application updates' },
    { key: 'pushPayments', label: 'Payment Updates', desc: 'Browser notifications for payments' },
    { key: 'pushNDA', label: 'NDA Requests', desc: 'Browser notifications for NDA requests' },
  ]

  useEffect(() => {
    if (!user) return;

    const mappedProfile = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      university: user.university || '',
      major: user.major || '',
      graduationYear: user.graduationYear || '',
      bio: user.bio || '',
      skills: user.skills || [],
      portfolio: user.portfolio || '',
      linkedin: user.linkedin || '',
      github: user.github || '',
      resume: user.resume || '',
    }

    setProfileData(mappedProfile);
    setTempProfileData(mappedProfile);
    setProfilePicture(user.profilePicture || null);
    setTempProfilePicture(user.profilePicture || null);
    setResumeUrl(user.resume || '');
    setTempResumeUrl(user.resume || '');

  }, [user])

  // ── Tab renderers ─────────────────────────────────────────────────────────
  const renderProfileTab = () => (
    <div>
      {/* Avatar + upload */}
      <div className="flex items-center gap-5 mb-7">
        {currentPhoto
          ? <img src={currentPhoto} alt="Profile" className="rounded-2xl object-cover border-2 border-slate-700 w-20 h-20" />
          : <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {currentProfile.name?.slice(0, 2).toUpperCase() || <User className="w-8 h-8" />}
          </div>
        }
        <div>
          <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif" onChange={handlePhotoUpload} className="hidden" />
          <button
            disabled={!isEditingProfile}
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all mb-2
              ${isEditingProfile
                ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer'
                : 'border-slate-700/50 text-slate-600 cursor-not-allowed opacity-50'}`}
          >
            <UploadIcon className="w-3.5 h-3.5" /> Upload Photo
          </button>
          <p className="text-xs text-slate-600">JPG, PNG or GIF · Max 2MB</p>
        </div>
      </div>

      <Divider />
      <SectionTitle title="Personal Information" subtitle="Your basic profile details" />

      <div className="grid grid-cols-2 gap-4 mb-2">
        <InputField label="Full Name" value={currentProfile.name} onChange={e => setTempProfileData(p => ({ ...p, name: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="Email" value={currentProfile.email} onChange={e => setTempProfileData(p => ({ ...p, email: e.target.value }))} disabled={!isEditingProfile} type="email" />
        <InputField label="Phone Number" value={currentProfile.phone} onChange={e => setTempProfileData(p => ({ ...p, phone: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="University" value={currentProfile.university} onChange={e => setTempProfileData(p => ({ ...p, university: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="Major" value={currentProfile.major} onChange={e => setTempProfileData(p => ({ ...p, major: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="Graduation Year" value={currentProfile.graduationYear} onChange={e => setTempProfileData(p => ({ ...p, graduationYear: e.target.value }))} disabled={!isEditingProfile} />

        <div className="col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bio</label>
          <textarea
            rows={4}
            value={currentProfile.bio}
            onChange={e => setTempProfileData(p => ({ ...p, bio: e.target.value }))}
            disabled={!isEditingProfile}
            className={`w-full px-4 py-2.5 rounded-xl text-sm border resize-none transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${!isEditingProfile
                ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600'}`}
          />
        </div>
      </div>

      <Divider />
      <SectionTitle title="Skills & Expertise" subtitle="Add skills that best represent your expertise" />

      <div className="flex flex-wrap gap-2 mb-3">
        {currentProfile.skills.map((skill, i) => (
          <span key={i} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-xl text-xs font-medium">
            {skill}
            {isEditingProfile && (
              <button onClick={() => setTempProfileData(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }))} className="hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {isEditingProfile && (
        <input
          type="text"
          placeholder="Add a new skill (press Enter)"
          className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const newSkill = e.target.value.trim();
              if (newSkill) {
                setTempProfileData(p => ({ ...p, skills: [...p.skills, newSkill] }));
                e.target.value = '';
              }
            }
          }}
        />
      )}

      <Divider />
      <SectionTitle title="Professional Links" subtitle="Your online presence and portfolio" />

      <div className="flex flex-col gap-4">
        <InputField label="Portfolio Website" value={currentProfile.portfolio} onChange={e => setTempProfileData(p => ({ ...p, portfolio: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="LinkedIn Profile" value={currentProfile.linkedin} onChange={e => setTempProfileData(p => ({ ...p, linkedin: e.target.value }))} disabled={!isEditingProfile} />
        <InputField label="GitHub Profile" value={currentProfile.github} onChange={e => setTempProfileData(p => ({ ...p, github: e.target.value }))} disabled={!isEditingProfile} />
      </div>

      <Divider />
      <SectionTitle title="Resume" subtitle="Upload your latest resume (PDF, DOC, DOCX)" />

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 mb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Current Resume</p>
              <p className="text-xs text-slate-500 mt-0.5 break-all">
                {tempResumeUrl ? getResumeNameFromUrl(tempResumeUrl) : 'No resume uploaded yet'}
              </p>
            </div>
          </div>

          {tempResumeUrl && (
            <button
              type="button"
              disabled={selectedResumeFile || isDownloadingResume}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selectedResumeFile || isDownloadingResume
                ? 'border-slate-700 text-slate-500 cursor-default'
                : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer'}`}
              onClick={handleViewResume}
            >
              {selectedResumeFile ? 'Selected from device' : isDownloadingResume ? 'Preparing...' : 'View'}
            </button>
          )}
        </div>

        <div className="mt-4">
          <input
            type="file"
            ref={resumeInputRef}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleResumeUpload}
            className="hidden"
          />
          <button
            disabled={!isEditingProfile}
            onClick={() => resumeInputRef.current?.click()}
            className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all
              ${isEditingProfile
                ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10 cursor-pointer'
                : 'border-slate-700/50 text-slate-600 cursor-not-allowed opacity-50'}`}
          >
            <UploadIcon className="w-3.5 h-3.5" /> Upload New Resume
          </button>
          <p className="text-xs text-slate-600 mt-2">Accepted: PDF, DOC, DOCX · Max 5MB</p>
        </div>
      </div>

      <FooterActions
        isEditing={isEditingProfile}
        isLoading={loading}
        onEdit={handleUpdateProfile}
        onCancel={handleCancelEdit}
        onSave={handleSaveChanges}
        editLabel="Edit Profile"
      />
    </div>
  )

  const renderNotificationsTab = () => {
    const NotifRow = ({ item }) => {
      const src = isEditingNotifications ? tempNotificationData : notifications
      return (
        <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3 hover:border-slate-600 transition-all">
          <div>
            <p className="text-sm font-medium text-white">{item.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
          </div>
          <Toggle
            checked={src[item.key]}
            disabled={!isEditingNotifications}
            onChange={e => setTempNotificationData(p => ({ ...p, [item.key]: e.target.checked }))}
          />
        </div>
      )
    }

    return (
      <div>
        <SectionTitle title="Email Notifications" subtitle="Control which emails you receive from us" />
        <div className="flex flex-col gap-3 mb-2">
          {emailRows.map(item => <NotifRow key={item.key} item={item} />)}
        </div>

        <Divider />
        <SectionTitle title="Push Notifications" subtitle="Browser-level notifications sent to your device" />
        <div className="flex flex-col gap-3">
          {pushRows.map(item => <NotifRow key={item.key} item={item} />)}
        </div>

        <FooterActions
          isEditing={isEditingNotifications}
          onEdit={handleUpdateNotifications}
          onCancel={handleCancelNotifications}
          onSave={handleSaveNotifications}
          editLabel="Edit Notifications"
        />
      </div>
    )
  }

  const renderSecurityTab = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
        <Shield className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-2">Security Settings</h3>
      <p className="text-slate-500 text-sm">Password, two-factor auth, and active sessions — coming soon.</p>
    </div>
  )

  const renderAccountTab = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-4">
        <CreditCard className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold mb-2">Account Settings</h3>
      <p className="text-slate-500 text-sm">Billing, subscription, and account management — coming soon.</p>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">

      {/* Page header */}
      <div className="mb-6">
        <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">Preferences</p>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-4 gap-5 items-start">

        {/* Sidebar */}
        <aside className="col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sticky top-6">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest px-3 py-2">Menu</p>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 last:mb-0
                    ${active ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Content panel */}
        <main className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'account' && renderAccountTab()}
        </main>

      </div>
    </div>
  )
}

export default Settings