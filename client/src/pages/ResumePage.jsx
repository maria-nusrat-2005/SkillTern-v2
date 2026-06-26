import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Download, 
  FileCheck, 
  AlertTriangle,
  Loader,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const ResumePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch the current student's profile to check if a resume exists (via cvUrl)
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/students/profile');
      return data.data;
    },
    enabled: user?.role === 'student',
  });

  // Query custom resume details if cvUrl exists
  const { data: resumeDetails, isLoading: isLoadingResume } = useQuery({
    queryKey: ['resumeDetails', user?.id],
    queryFn: async () => {
      // We will check if the resume document is saved in the database
      // The backend returns a redirect for download, but we can query it safely or use details from Profile
      // Let's call download or similar, but wait - is there a direct get resume route?
      // Since there is no explicit GET /resume details, let's fetch the resume model if we can,
      // or we can deduce it from the profile or custom API calls.
      // Wait, let's check if we can query Resume model. Let's make a request to /resume/download or just keep it simple.
      // Wait, let's check if the profile has cvUrl. If it does, we can show active details.
      return null;
    },
    enabled: false
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cv', file);
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: () => {
      setSuccessMsg('Resume uploaded successfully!');
      setSelectedFile(null);
      setSelectedFileName('');
      queryClient.invalidateQueries(['profile']);
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to upload resume.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  });

  // Update/Replace mutation
  const updateMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('cv', file);
      const { data } = await api.put('/resume/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.data;
    },
    onSuccess: () => {
      setSuccessMsg('Resume replaced and updated successfully!');
      setSelectedFile(null);
      setSelectedFileName('');
      queryClient.invalidateQueries(['profile']);
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update resume.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/resume/delete');
      return data;
    },
    onSuccess: () => {
      setSuccessMsg('Resume document deleted successfully.');
      queryClient.invalidateQueries(['profile']);
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to delete resume.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    
    // Check format
    const isDoc = file.name.endsWith('.docx') || file.name.endsWith('.pdf');
    if (!isDoc) {
      setErrorMsg('Invalid file type. Only PDF and DOCX files are allowed.');
      setSelectedFile(null);
      setSelectedFileName('');
      return;
    }

    // Check size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      setSelectedFileName('');
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setSelectedFileName(file.name);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) return;
    if (profile?.cvUrl) {
      updateMutation.mutate(selectedFile);
    } else {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleDeleteSubmit = () => {
    if (window.confirm('Are you sure you want to permanently delete your resume? This will also reduce your profile completion score.')) {
      deleteMutation.mutate();
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const isPending = uploadMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Resume Management <FileText size={22} className="text-emerald-400" />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload and manage your primary CV document. This document will be attached to all internship applications.
        </p>
      </div>

      {/* Messaging Banners */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-up">
          <CheckCircle size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2 animate-slide-up">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Upload box */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {profile?.cvUrl ? 'Replace / Update Resume' : 'Upload Resume Document'}
            </h3>

            {/* Drag & drop upload box */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative group flex flex-col items-center justify-center space-y-3 bg-slate-800/10 hover:bg-slate-800/20 ${
                isDragOver 
                  ? 'border-emerald-500 bg-emerald-500/5' 
                  : selectedFile 
                  ? 'border-emerald-500/40' 
                  : 'border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <input 
                type="file" 
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              
              {selectedFile ? (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <FileCheck size={36} />
                </div>
              ) : (
                <div className="p-3 bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-slate-200 group-hover:border-slate-600 rounded-xl transition-all">
                  <UploadCloud size={36} />
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-semibold text-white font-sans">
                  {selectedFileName || 'Drag and drop your file here, or click to browse'}
                </p>
                <p className="text-xs text-slate-500">
                  Supports PDF or DOCX file formats (Max 5MB)
                </p>
              </div>

              {selectedFile && (
                <div className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                  File Selected: {formatBytes(selectedFile.size)}
                </div>
              )}
            </div>

            {/* Action panel */}
            {selectedFile && (
              <div className="flex gap-3 justify-end animate-fade-in">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFileName('');
                  }}
                  disabled={isPending}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg border border-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={isPending}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
                >
                  {isPending ? (
                    <Loader size={12} className="animate-spin" />
                  ) : (
                    <UploadCloud size={12} />
                  )}
                  {profile?.cvUrl ? 'Save & Replace' : 'Complete Upload'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status & rules card */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Status</h3>

            {profile?.cvUrl ? (
              <div className="space-y-4">
                {/* Active badge layout */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">Active CV Online</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                    Cloudinary Verified
                  </span>
                </div>

                {/* Details list */}
                <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">resume.pdf / resume.docx</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Attached to applications</p>
                  </div>
                </div>

                {/* File Action Controls */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href="http://localhost:5000/api/resume/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-750 transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </a>
                  <button
                    onClick={handleDeleteSubmit}
                    disabled={isPending}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete File
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2.5">
                <div className="w-12 h-12 bg-slate-850 border border-slate-800 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">No resume uploaded</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Upload a document to unlock internship application features</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick tips list */}
          <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <HelpCircle size={12} className="text-emerald-400" />
              Requirements & Guidance
            </h3>
            <ul className="text-slate-400 text-xs space-y-2 list-disc pl-4 font-sans leading-relaxed">
              <li>Keep documents clean and update regularly when acquiring new technical skills.</li>
              <li>Only <strong>PDF</strong> and <strong>DOCX</strong> files are accepted by our recruiter parsing parser.</li>
              <li>File size must be strictly under <strong>5 megabytes (MB)</strong>.</li>
              <li>Uploading a resume boosts your profile completion indicator score by <strong>10%</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
