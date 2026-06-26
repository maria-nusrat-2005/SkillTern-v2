import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, CheckCircle, ExternalLink, Globe, Landmark, Mail, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  // Fetch all recruiter profiles
  const { data: recruiters, isLoading, error } = useQuery({
    queryKey: ['admin', 'recruiters'],
    queryFn: async () => {
      const { data } = await api.get('/admin/recruiters');
      return data.data;
    }
  });

  // Verify recruiter profile mutation
  const verifyMutation = useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.put(`/admin/recruiters/${userId}/verify`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'recruiters'] });
    }
  });

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
      Failed to load recruiters list. Verify your session and administrative privileges.
    </div>
  );

  const unverifiedCount = recruiters?.filter(r => !r.verified).length || 0;
  const verifiedCount = recruiters?.filter(r => r.verified).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Moderation & Approvals <ShieldCheck className="text-emerald-400" size={24} />
        </h1>
        <p className="text-slate-400 text-sm mt-1">Review recruiter profile registrations and approve access to post internships.</p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Pending Verification</p>
            <p className="text-2xl font-extrabold text-white mt-1">{unverifiedCount}</p>
          </div>
        </div>

        <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Recruiters</p>
            <p className="text-2xl font-extrabold text-white mt-1">{verifiedCount}</p>
          </div>
        </div>
      </div>

      {/* Recruiters List */}
      <div className="bg-surface-900 border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Companies</h2>
        </div>

        {recruiters?.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Landmark className="mx-auto text-slate-700" size={40} />
            <p className="text-sm">No recruiter profiles are registered on the platform.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recruiters?.map((recruiter) => (
              <div key={recruiter._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-800/20 transition-all duration-150">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-white text-base">{recruiter.companyName || 'Unnamed Company'}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      recruiter.verified
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {recruiter.verified ? 'Verified' : 'Pending Approval'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl whitespace-pre-line">
                    {recruiter.companyDescription || 'No description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                    {recruiter.userId && (
                      <>
                        <span className="flex items-center gap-1.5"><Mail size={12} />{recruiter.userId.name} ({recruiter.userId.email})</span>
                      </>
                    )}
                    {recruiter.industry && (
                      <span className="flex items-center gap-1.5"><Landmark size={12} />{recruiter.industry}</span>
                    )}
                    {recruiter.website && (
                      <a 
                        href={recruiter.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1 text-emerald-400 hover:underline"
                      >
                        <Globe size={12} /> Website <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Approve Action */}
                {!recruiter.verified && recruiter.userId && (
                  <div className="shrink-0">
                    <button
                      onClick={() => verifyMutation.mutate(recruiter.userId._id)}
                      disabled={verifyMutation.isPending}
                      className="w-full md:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      {verifyMutation.isPending && verifyMutation.variables === recruiter.userId._id ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      Approve Recruiter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
