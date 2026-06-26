import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Briefcase, 
  Send, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const InternshipDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['internship', id],
    queryFn: async () => { 
      const { data } = await api.get(`/internships/${id}`); 
      return data.data; 
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => { 
      const { data } = await api.post('/applications', { internshipId: id }); 
      return data; 
    },
    onSuccess: () => navigate('/applications'),
  });

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!data) return <div className="text-center py-16 text-slate-400">Internship not found</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft size={16} />Back to Discovery
      </Link>

      <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-white">{data.title}</h1>
            <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border ${
              data.internshipType === 'Remote' 
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
                : data.internshipType === 'Hybrid' 
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
            }`}>
              {data.internshipType}
            </span>
          </div>
          {data.company && <p className="text-sm text-slate-400">{data.company.companyName}</p>}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><MapPin size={14} />{data.location}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{data.duration}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={14} />{data.category}</span>
            <span className="text-emerald-400 font-semibold">{data.stipend}</span>
          </div>
        </div>

        {/* Smart Matching Explanation Widget for Students */}
        {user?.role === 'student' && data.match && (
          <div className="p-5 bg-slate-850/60 border border-slate-850 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl flex items-center justify-center ${
                  data.match.score >= 75
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : data.match.score >= 40
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Match Analysis: <span className={
                      data.match.score >= 75
                        ? 'text-emerald-400'
                        : data.match.score >= 40
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }>{data.match.score}% Match</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{data.match.recommendationReason}</p>
                </div>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-850/80">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <CheckCircle size={12} className="text-emerald-500" />
                  Matched Skills ({data.match.matchedSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.match.matchedSkills?.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">None matched</span>
                  ) : (
                    data.match.matchedSkills?.map(s => (
                      <span key={s} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                  <AlertCircle size={12} className="text-red-500" />
                  Missing Skills ({data.match.missingSkills?.length || 0})
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.match.missingSkills?.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No missing skills</span>
                  ) : (
                    data.match.missingSkills?.map(s => (
                      <span key={s} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Skill Gap Learning Path */}
            {data.match.potentialImprovements?.length > 0 && (
              <div className="border-t border-slate-850/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-emerald-400" />
                  Skill Gap & Learning Recommendations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.match.potentialImprovements.map((item) => (
                    <div key={item.skill} className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.skill}</span>
                        <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          +{item.improvementValue}% Score
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{item.suggestion}</p>
                      <a
                        href={item.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium pt-1"
                      >
                        {item.resourceName} <ArrowRight size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300">Description</h2>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{data.description}</p>
        </div>

        {/* Skills */}
        {data.requiredSkills?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.requiredSkills.map((s) => (
                <span key={s} className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/50">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply CTA */}
        {user?.role === 'student' && (
          <div className="pt-4 border-t border-slate-800/50">
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {applyMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Apply Now
            </button>
            {applyMutation.isError && (
              <p className="text-xs text-red-400 mt-2">
                {applyMutation.error?.response?.data?.message || 'Application failed'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InternshipDetailPage;
