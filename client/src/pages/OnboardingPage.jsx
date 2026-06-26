import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Building2, 
  Code, 
  UploadCloud, 
  Plus, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const isStudent = user?.role === 'student';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    university: '',
    degree: '',
    graduationYear: new Date().getFullYear() + 1,
    skills: [],
    interests: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');

  // Recruiter Form State
  const [recruiterForm, setRecruiterForm] = useState({
    companyName: '',
    industry: '',
    website: '',
    companyDescription: ''
  });

  const handleStudentChange = (e) => {
    const val = e.target.name === 'graduationYear' ? parseInt(e.target.value, 10) || '' : e.target.value;
    setStudentForm({ ...studentForm, [e.target.name]: val });
    setError('');
  };

  const handleRecruiterChange = (e) => {
    setRecruiterForm({ ...recruiterForm, [e.target.name]: e.target.value });
    setError('');
  };

  // Skill management
  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !studentForm.skills.includes(val)) {
      setStudentForm({ ...studentForm, skills: [...studentForm.skills, val] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setStudentForm({ ...studentForm, skills: studentForm.skills.filter(s => s !== skill) });
  };

  // Interest management
  const addInterest = () => {
    const val = interestInput.trim();
    if (val && !studentForm.interests.includes(val)) {
      setStudentForm({ ...studentForm, interests: [...studentForm.interests, val] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest) => {
    setStudentForm({ ...studentForm, interests: studentForm.interests.filter(i => i !== interest) });
  };

  // CV File Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate type
      const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.mimetype || file.type)) {
        setError('Only PDF and DOCX files are allowed.');
        return;
      }
      // Validate size
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds the 5MB limit.');
        return;
      }
      setCvFile(file);
      setCvFileName(file.name);
      setError('');
    }
  };

  const handleNextStep = () => {
    if (isStudent) {
      if (step === 1 && (!studentForm.university || !studentForm.degree)) {
        setError('Please fill in both university and degree.');
        return;
      }
    } else {
      if (step === 1 && (!recruiterForm.companyName || !recruiterForm.industry)) {
        setError('Please fill in both company name and industry.');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isStudent) {
        // 1. Upload CV if chosen
        if (cvFile) {
          const formData = new FormData();
          formData.append('cv', cvFile);
          await api.post('/students/upload-cv', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        // 2. Save profile details
        await api.put('/students/profile', studentForm);
      } else {
        // Save recruiter details
        await api.put('/recruiters/profile', recruiterForm);
      }

      setSuccess(true);
      await checkAuth(); // Reload updated profile context

      setTimeout(() => {
        navigate(isStudent ? '/dashboard' : '/recruiter/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const primaryColorClass = isStudent ? 'emerald' : 'violet';

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in max-w-md mx-auto">
        <div className={`w-16 h-16 bg-${primaryColorClass}-500/10 border border-${primaryColorClass}-500/20 text-${primaryColorClass}-400 rounded-full flex items-center justify-center shadow-lg shadow-${primaryColorClass}-500/10`}>
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">Profile Setup Complete!</h2>
        <p className="text-slate-400 text-sm">Preparing your dashboard experience...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      {/* Header card */}
      <div className="bg-surface-900 border border-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Welcome to Skilltern <Sparkles size={20} className={`text-${primaryColorClass}-400`} />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Let's set up your profile to match you with opportunities</p>
          </div>
          <div className={`text-xs px-2.5 py-1 bg-${primaryColorClass}-500/10 border border-${primaryColorClass}-500/20 text-${primaryColorClass}-400 font-bold rounded-full capitalize`}>
            {user?.role}
          </div>
        </div>

        {/* Steps bar */}
        <div className="flex items-center gap-2 pt-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? `bg-${primaryColorClass}-500` : 'bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? `bg-${primaryColorClass}-500` : 'bg-slate-800'}`} />
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-up">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Main wizard forms */}
      <form onSubmit={handleSubmit} className="bg-surface-900 border border-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        {isStudent ? (
          // ==================== STUDENT FLOW ====================
          step === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <GraduationCap size={18} />
                Step 1: Academic Profile
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">University</label>
                <input
                  type="text"
                  name="university"
                  value={studentForm.university}
                  onChange={handleStudentChange}
                  placeholder="e.g. State University"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Degree & Field of Study</label>
                <input
                  type="text"
                  name="degree"
                  value={studentForm.degree}
                  onChange={handleStudentChange}
                  placeholder="e.g. B.Sc. in Computer Science"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={studentForm.graduationYear}
                  onChange={handleStudentChange}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Code size={18} />
                Step 2: Skills, Interests & Resume
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Technical Skills</label>
                <div className="flex flex-wrap gap-2">
                  {studentForm.skills.map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-emerald-500/60 hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
                    }}
                    placeholder="Type a skill (e.g. React) and press Enter"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
                  />
                  <button type="button" onClick={addSkill} className="px-3 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/60 rounded-xl transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Interests & Domains</label>
                <div className="flex flex-wrap gap-2">
                  {studentForm.interests.map(i => (
                    <span key={i} className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {i}
                      <button type="button" onClick={() => removeInterest(i)} className="text-emerald-500/60 hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addInterest(); }
                    }}
                    placeholder="Type an interest (e.g. Web Dev) and press Enter"
                    className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
                  />
                  <button type="button" onClick={addInterest} className="px-3 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/60 rounded-xl transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* CV Resume Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Upload CV/Resume</label>
                <div className="relative border-2 border-dashed border-slate-700/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-500/40 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    id="cv-upload-input"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud size={32} className="text-slate-500 group-hover:text-emerald-400 transition-colors mb-2" />
                  <span className="text-sm font-semibold text-white">
                    {cvFileName || 'Select your PDF or DOCX resume'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Maximum file size: 5MB</span>
                </div>
              </div>
            </div>
          )
        ) : (
          // ==================== RECRUITER FLOW ====================
          step === 1 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Building2 size={18} />
                Step 1: Company Profile
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={recruiterForm.companyName}
                  onChange={handleRecruiterChange}
                  placeholder="e.g. Acme Tech Inc."
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={recruiterForm.industry}
                  onChange={handleRecruiterChange}
                  placeholder="e.g. Software, E-Commerce"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={recruiterForm.website}
                  onChange={handleRecruiterChange}
                  placeholder="https://acme.tech"
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Building2 size={18} />
                Step 2: Company Description
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">About the Company</label>
                <textarea
                  name="companyDescription"
                  value={recruiterForm.companyDescription}
                  onChange={handleRecruiterChange}
                  rows={6}
                  placeholder="Provide a brief description of the company and what it offers..."
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/60 rounded-xl text-sm text-white focus:ring-2 focus:ring-violet-500/40 focus:outline-none transition-all resize-none"
                />
              </div>
            </div>
          )
        )}

        {/* Button controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-750 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className={`flex items-center gap-1.5 px-5 py-2.5 bg-${primaryColorClass}-500 hover:bg-${primaryColorClass}-600 text-xs font-bold text-white rounded-xl transition-all shadow-lg shadow-${primaryColorClass}-500/10`}
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-${primaryColorClass}-500 to-${primaryColorClass}-600 hover:from-${primaryColorClass}-600 hover:to-${primaryColorClass}-700 text-xs font-extrabold text-white rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-${primaryColorClass}-500/20`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Complete Setup <CheckCircle size={14} /></>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OnboardingPage;
