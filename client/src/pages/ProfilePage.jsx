import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  Plus, 
  X, 
  GraduationCap, 
  Code, 
  FolderOpen, 
  Briefcase, 
  User, 
  Trash2, 
  Heart,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Github,
  PlusCircle,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const CATEGORIES = [
  'Web Development',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Development',
  'DevOps / Cloud',
  'Data Science / AI',
  'UI/UX Design',
  'Software Engineering'
];

const ProfilePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom states
  const [skillInput, setSkillInput] = useState('');
  const [expOpen, setExpOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  // Forms
  const [expForm, setExpForm] = useState({ company: '', role: '', startDate: '', endDate: '', duration: '', description: '' });
  const [eduForm, setEduForm] = useState({ school: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear() - 2, endYear: '' });
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });

  const isStudent = user?.role === 'student';
  const endpoint = isStudent ? '/students/profile' : '/recruiters/profile';

  // Query Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return data.data;
    },
  });

  // Query Projects for students
  const { data: projects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data.data;
    },
    enabled: isStudent && !!profile,
  });

  const [form, setForm] = useState(null);

  // Initialize form when profile loads
  React.useEffect(() => {
    if (profile && !form) {
      if (isStudent) {
        setForm({
          university: profile.university || '',
          degree: profile.degree || '',
          graduationYear: profile.graduationYear || new Date().getFullYear() + 1,
          skills: profile.skills || [],
          interests: profile.interests || [],
          portfolioLinks: profile.portfolioLinks || [],
          githubProfile: profile.githubProfile || '',
        });
      } else {
        setForm({
          companyName: profile.companyName || '',
          industry: profile.industry || '',
          website: profile.website || '',
          companyDescription: profile.companyDescription || '',
        });
      }
    }
  }, [profile, form, isStudent]);

  // Save General profile settings
  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await api.put(endpoint, form);
      queryClient.invalidateQueries(['profile']);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Skill actions
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm({ ...form, skills: [...form.skills, trimmed] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  // Interest toggles
  const handleInterestToggle = (interest) => {
    const updated = form.interests.includes(interest)
      ? form.interests.filter(i => i !== interest)
      : [...form.interests, interest];
    setForm({ ...form, interests: updated });
  };

  // Experience Submission
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expForm.company || !expForm.role) return;
    try {
      await api.post('/students/experience', expForm);
      queryClient.invalidateQueries(['profile']);
      setExpForm({ company: '', role: '', startDate: '', endDate: '', duration: '', description: '' });
      setExpOpen(false);
      setSuccessMsg('Work experience entry added!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add experience.');
    }
  };

  // Education Submission
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduForm.school || !eduForm.degree || !eduForm.startYear) return;
    try {
      await api.post('/students/education', eduForm);
      queryClient.invalidateQueries(['profile']);
      setEduForm({ school: '', degree: '', fieldOfStudy: '', startYear: new Date().getFullYear() - 2, endYear: '' });
      setEduOpen(false);
      setSuccessMsg('Education record added!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add education.');
    }
  };

  // Projects CRUD Actions
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) return;
    try {
      const payload = {
        ...projectForm,
        technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean)
      };
      await api.post('/projects', payload);
      queryClient.invalidateQueries(['profile']);
      refetchProjects();
      setProjectForm({ title: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });
      setProjectOpen(false);
      setSuccessMsg('Showcase project published!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Delete this showcase project?')) {
      try {
        await api.delete(`/projects/${projectId}`);
        queryClient.invalidateQueries(['profile']);
        refetchProjects();
        setSuccessMsg('Project removed successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        setErrorMsg('Failed to delete project.');
      }
    }
  };

  if (isLoading || !form) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {isStudent ? 'Profile & Settings' : 'Company Profile'}
            <User size={22} className={isStudent ? 'text-emerald-400' : 'text-violet-400'} />
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isStudent ? 'Manage your academic details, experience logs, showcase projects, and matching filters.' : 'Configure company branding details and verified recruiting tags.'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 ${
            isStudent 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20' 
              : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 shadow-violet-500/20'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </button>
      </div>

      {/* Messaging Banners */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl animate-slide-up">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl animate-slide-up">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Form Data */}
        <div className="lg:col-span-2 space-y-6">
          {isStudent ? (
            <>
              {/* Academic info */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <GraduationCap size={18} />
                  Academic Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">University</label>
                    <input name="university" value={form.university} onChange={handleChange}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Degree Program</label>
                    <input name="degree" value={form.degree} onChange={handleChange}
                      placeholder="e.g. BS in Computer Science"
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Graduation Year</label>
                    <input name="graduationYear" type="number" value={form.graduationYear} onChange={handleChange}
                      className="w-full px-3.5 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Github Profile URL</label>
                    <div className="relative">
                      <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input name="githubProfile" value={form.githubProfile} onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Showcase Projects CRUD */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <FolderOpen size={18} />
                    Showcase Projects & Portfolio ({projects.length})
                  </div>
                  <button
                    type="button"
                    onClick={() => setProjectOpen(!projectOpen)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    {projectOpen ? <X size={14} /> : <Plus size={14} />}
                    {projectOpen ? 'Close Panel' : 'Publish Project'}
                  </button>
                </div>

                {/* Inline Project Add Form */}
                {projectOpen && (
                  <form onSubmit={handleAddProject} className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3.5 animate-slide-up">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Showcase Project</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Project Title</label>
                          <input 
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            placeholder="e.g. Chat App Frontend" 
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Technologies (comma separated)</label>
                          <input 
                            value={projectForm.technologies}
                            onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                            placeholder="React, Socket.io, Tailwind" 
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Short Description</label>
                        <textarea 
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                          placeholder="Briefly describe what this project showcases..."
                          rows={2.5}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">GitHub Repo URL</label>
                          <input 
                            value={projectForm.githubUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                            placeholder="https://github.com/..." 
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Live Demo URL</label>
                          <input 
                            value={projectForm.liveUrl}
                            onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                            placeholder="https://..." 
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-white font-semibold text-xs rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/10">
                        Publish Project
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects grid */}
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No showcase projects registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {projects.map((proj) => (
                      <div key={proj._id} className="p-4 bg-slate-850 border border-slate-800 rounded-xl relative group flex flex-col justify-between hover:border-slate-700 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <h5 className="font-semibold text-xs text-white line-clamp-1">{proj.title}</h5>
                            <button
                              onClick={() => handleDeleteProject(proj._id)}
                              className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors self-start shrink-0"
                              title="Delete Project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies?.map((tech) => (
                              <span key={tech} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Link row */}
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-800/60 mt-3 text-[10px] text-emerald-400">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                              <Github size={10} /> GitHub
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                              <LinkIcon size={10} /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Experiences */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <Briefcase size={18} />
                    Work Experience Logs ({profile.experiences?.length || 0})
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpOpen(!expOpen)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    {expOpen ? <X size={14} /> : <Plus size={14} />}
                    {expOpen ? 'Close Panel' : 'Add Experience'}
                  </button>
                </div>

                {expOpen && (
                  <form onSubmit={handleAddExperience} className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3 animate-slide-up">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Experience</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Company Name</label>
                        <input 
                          value={expForm.company}
                          onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                          placeholder="e.g. Google" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Role / Title</label>
                        <input 
                          value={expForm.role}
                          onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                          placeholder="e.g. Software Engineer Intern" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Duration (e.g. 3 Months)</label>
                        <input 
                          value={expForm.duration}
                          onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                          placeholder="e.g. 3 Months" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">StartDate</label>
                        <input 
                          type="date"
                          value={expForm.startDate}
                          onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Role Description / Achievements</label>
                      <textarea 
                        value={expForm.description}
                        onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                        placeholder="Detail technologies used and key accomplishments..."
                        rows={2.5}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-white font-semibold text-xs rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/10">
                        Append Experience
                      </button>
                    </div>
                  </form>
                )}

                {/* Experiences timeline list */}
                {(!profile.experiences || profile.experiences.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No work experience logs declared.</p>
                ) : (
                  <div className="space-y-3 pl-2">
                    {profile.experiences.map((exp, idx) => (
                      <div key={exp._id || idx} className="p-3.5 bg-slate-850 border border-slate-800/80 rounded-xl relative flex items-start gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
                          <Briefcase size={14} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-xs font-semibold text-white">{exp.role} • <span className="text-slate-400">{exp.company}</span></h5>
                          {exp.duration && <p className="text-[10px] text-emerald-400 font-semibold">{exp.duration}</p>}
                          {exp.description && <p className="text-[11px] text-slate-400 leading-normal">{exp.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Education Background */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                    <GraduationCap size={18} />
                    Education Background ({profile.education?.length || 0})
                  </div>
                  <button
                    type="button"
                    onClick={() => setEduOpen(!eduOpen)}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    {eduOpen ? <X size={14} /> : <Plus size={14} />}
                    {eduOpen ? 'Close Panel' : 'Add Education'}
                  </button>
                </div>

                {eduOpen && (
                  <form onSubmit={handleAddEducation} className="p-4 bg-slate-850 border border-slate-800 rounded-xl space-y-3 animate-slide-up">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Add Education</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">School / College Name</label>
                        <input 
                          value={eduForm.school}
                          onChange={(e) => setEduForm({ ...eduForm, school: e.target.value })}
                          placeholder="e.g. Stanford University" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Degree</label>
                        <input 
                          value={eduForm.degree}
                          onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                          placeholder="e.g. Bachelor of Science" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Field Of Study</label>
                        <input 
                          value={eduForm.fieldOfStudy}
                          onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                          placeholder="e.g. Computer Science" 
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Start Year</label>
                        <input 
                          type="number"
                          value={eduForm.startYear}
                          onChange={(e) => setEduForm({ ...eduForm, startYear: parseInt(e.target.value, 10) })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-white font-semibold text-xs rounded-lg hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/10">
                        Append Education
                      </button>
                    </div>
                  </form>
                )}

                {/* Education list */}
                {(!profile.education || profile.education.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No academic history records declared.</p>
                ) : (
                  <div className="space-y-3 pl-2">
                    {profile.education.map((edu, idx) => (
                      <div key={edu._id || idx} className="p-3.5 bg-slate-850 border border-slate-800/80 rounded-xl relative flex items-start gap-3">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg shrink-0">
                          <GraduationCap size={14} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-xs font-semibold text-white">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h5>
                          <p className="text-[11px] text-slate-400">{edu.school} • <span className="font-semibold text-emerald-400">{edu.startYear} - {edu.endYear || 'Present'}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Recruiter Branding Form */
            <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                <Briefcase size={18} />
                Company Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Company Name</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400">Industry</label>
                  <input name="industry" value={form.industry} onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Website</label>
                  <input name="website" value={form.website} onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Company Description</label>
                  <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={4}
                    className="w-full px-3 py-2 bg-slate-850 border border-slate-800 rounded-lg text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all resize-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Skills & Interests sidebar */}
        <div className="space-y-6">
          {/* Skills manager */}
          {isStudent && (
            <>
              {/* Profile completeness percentage score */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Completion</h3>
                <div className="flex items-center justify-between">
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mr-3">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${profile.profileCompletion || 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400 shrink-0">
                    {profile.profileCompletion || 0}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Completing your profile items (technical skills, work experiences, CV, and showcase projects) increases your match accuracy score.
                </p>
              </div>

              {/* Skills Editor */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <Code size={16} />
                  Technical Skills
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No skills added yet</span>
                  ) : (
                    form.skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-emerald-500/60 hover:text-red-400 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Add technology tag..."
                    className="flex-1 px-3 py-1.5 bg-slate-850 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  />
                  <button type="button" onClick={addSkill} className="p-1.5 bg-slate-800 border border-slate-850 hover:bg-slate-750 rounded-lg text-slate-300 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Category Interests Editor */}
              <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <Heart size={16} />
                  Matching Category Interests
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Select your targeted technology tracks. These interests drive your matches scoring.
                </p>

                <div className="space-y-2 pt-1">
                  {CATEGORIES.map((cat) => {
                    const isChecked = form.interests.includes(cat);
                    return (
                      <label key={cat} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleInterestToggle(cat)}
                          className="rounded bg-slate-850 border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span className={`transition-colors group-hover:text-white ${isChecked ? 'text-white font-medium' : 'text-slate-400'}`}>
                          {cat}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
