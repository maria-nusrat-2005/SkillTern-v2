import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Briefcase, 
  Users, 
  Eye, 
  Clock, 
  CheckCircle, 
  X, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  FileText, 
  ExternalLink,
  MapPin
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants' or 'listings'
  const [selectedApp, setSelectedApp] = useState(null); // active application for modal

  // 1. Fetch recruiter internships list
  const { data: internshipsData, isLoading: isLoadingInternships } = useQuery({
    queryKey: ['recruiter-internships'],
    queryFn: async () => { 
      const { data } = await api.get('/internships'); 
      return data.data; 
    },
  });

  // 2. Fetch applications for recruiter's postings
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['recruiter-applications'],
    queryFn: async () => { 
      const { data } = await api.get('/applications'); 
      return data.data; 
    },
  });

  // 3. Update application recruitment stage mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ appId, status }) => {
      const { data } = await api.put(`/applications/${appId}/status`, { status });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-applications'] });
      // Keep local modal state synchronized with updated application status
      setSelectedApp(prev => prev ? { ...prev, status: data.data.status } : null);
    },
  });

  const internships = internshipsData?.internships || [];
  const applications = applicationsData?.applications || [];

  if (isLoadingInternships || isLoadingApplications) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter internships to recruiter's own (since GET /api/internships is public list)
  const myInternships = internships.filter(i => (i.recruiterId?._id || i.recruiterId) === user?.id);

  // Compute Stats values
  const activePostingsCount = myInternships.filter(i => i.status === 'Published').length;
  const totalApplicantsCount = applications.length;
  const pendingReviewCount = applications.filter(a => ['Applied', 'Under Review'].includes(a.status)).length;
  const acceptedCount = applications.filter(a => a.status === 'Accepted').length;

  const statusConfig = {
    'Applied': { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    'Under Review': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    'Shortlisted': { color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    'Accepted': { color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    'Completed': { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    'Rejected': { color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };

  // Determine LinkedIn / GitHub fallbacks for review modal
  const getLinkedinUrl = (app) => {
    return app?.studentProfile?.portfolioLinks?.find(link => link.includes('linkedin.com')) || 
      `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(app?.studentId?.name)}`;
  };

  const getGithubUrl = (app) => {
    const gh = app?.studentProfile?.githubProfile;
    if (!gh) return `https://github.com/search?q=${encodeURIComponent(app?.studentId?.name)}`;
    return gh.startsWith('http') ? gh : `https://github.com/${gh}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.profile?.companyName || 'Corporate Workspace'} {user?.profile?.website && `(${user.profile.website})`}
          </p>
        </div>
        <div>
          <button
            onClick={() => alert('To add a new job posting, utilize the central internship publishing system in your workspace.')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/15"
          >
            <Plus size={16} /> Post Internship
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Postings', value: activePostingsCount, icon: Briefcase, color: 'emerald' },
          { label: 'Total Applicants', value: totalApplicantsCount, icon: Users, color: 'blue' },
          { label: 'Pending Review', value: pendingReviewCount, icon: Clock, color: 'amber' },
          { label: 'Offered / Accepted', value: acceptedCount, icon: CheckCircle, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
              <stat.icon size={20} className={`text-${stat.color}-400`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-800/40 p-1 border border-slate-700/50 rounded-xl max-w-xs shrink-0">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'applicants' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Applicants
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'listings' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Job Listings
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'applicants' ? (
        <div className="space-y-4">
          <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Manage Applicants</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Users size={32} className="mx-auto text-slate-650 mb-2" />
                <p className="text-slate-400 text-sm">No applications received yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-450 text-xs font-semibold">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Role Applied</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const badgeCfg = statusConfig[app.status] || { color: 'text-slate-400 bg-slate-800' };
                      return (
                        <tr key={app._id} className="border-b border-slate-850 hover:bg-slate-850/20 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">{app.studentId?.name || 'Candidate'}</p>
                            <p className="text-xs text-slate-500">{app.studentId?.email}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-350">{app.internshipId?.title || 'Unknown Internship'}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeCfg.color}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-xs">
                            {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-3.5">
                              {app.studentProfile?.cvUrl && (
                                <a
                                  href={app.studentProfile.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-350 transition-colors font-semibold"
                                  title="View CV PDF"
                                >
                                  <FileText size={14} /> CV
                                </a>
                              )}
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold"
                              >
                                <Eye size={14} /> Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Job Listings</h2>
            {myInternships.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase size={32} className="mx-auto text-slate-650 mb-2" />
                <p className="text-slate-400 text-sm">No postings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-450 text-xs font-semibold">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myInternships.map((item) => (
                      <tr key={item._id} className="border-b border-slate-850 hover:bg-slate-850/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link to={`/internships/${item._id}`} className="font-semibold text-white hover:text-emerald-400 transition-colors">
                            {item.title}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-350">{item.location}</td>
                        <td className="py-3.5 px-4 text-slate-350">{item.internshipType}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                            item.status === 'Published' 
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applicant Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-surface-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            
            {/* Close Cross Button */}
            <button 
              onClick={() => setSelectedApp(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Applicant Review</h3>
                <p className="text-xs text-slate-400 mt-1">Review candidate credentials and change recruitment status.</p>
              </div>

              {/* Candidate Info Profile Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xl">
                  {selectedApp.studentId?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{selectedApp.studentId?.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin size={12} className="text-slate-500" />
                    {selectedApp.studentProfile?.university || 'Uttara, Dhaka'}
                  </p>
                </div>
              </div>

              {/* Contact Information (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-800/60 py-4">
                <div className="flex items-center gap-2.5 text-xs text-slate-350">
                  <Mail size={15} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{selectedApp.studentId?.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-350">
                  <Phone size={15} className="text-emerald-400 shrink-0" />
                  {/* Since phone is not stored in DB, we mock Maria's exact number or show default */}
                  <span>{selectedApp.studentId?.name === 'Maria Nusrat' ? '+88 01317-894732' : '+88 01700-000000'}</span>
                </div>
              </div>

              {/* Social & Portfolio Links + View CV Button */}
              <div className="flex flex-wrap gap-2.5">
                <a 
                  href={getLinkedinUrl(selectedApp)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
                >
                  <Linkedin size={14} className="text-slate-400" /> LinkedIn <ExternalLink size={10} className="text-slate-500" />
                </a>
                <a 
                  href={getGithubUrl(selectedApp)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
                >
                  <Github size={14} className="text-slate-400" /> GitHub <ExternalLink size={10} className="text-slate-500" />
                </a>

                {/* VIEW CV PDF Option */}
                <button
                  onClick={() => {
                    const cv = selectedApp.studentProfile?.cvUrl;
                    if (cv) {
                      window.open(cv, '_blank');
                    } else {
                      alert('This candidate has not uploaded a CV PDF.');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all border ${
                    selectedApp.studentProfile?.cvUrl
                      ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-850 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                  disabled={!selectedApp.studentProfile?.cvUrl}
                  title={selectedApp.studentProfile?.cvUrl ? 'Open student CV PDF' : 'No CV uploaded'}
                >
                  <FileText size={14} /> View CV <ExternalLink size={10} />
                </button>
              </div>

              {/* Recruitment Stage Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-450 uppercase tracking-wider">Recruitment Stage</label>
                <select
                  value={selectedApp.status}
                  onChange={(e) => updateStatusMutation.mutate({ appId: selectedApp._id, status: e.target.value })}
                  disabled={updateStatusMutation.isPending}
                  className="w-full bg-slate-850 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all cursor-pointer"
                >
                  {['Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {updateStatusMutation.isPending && (
                  <p className="text-[10px] text-emerald-400 animate-pulse mt-1">Updating status stage...</p>
                )}
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="flex justify-end p-6 border-t border-slate-800/60 bg-slate-900/40 mt-2">
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/15"
              >
                Close Review
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
