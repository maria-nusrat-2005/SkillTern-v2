import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye } from 'lucide-react';
import api from '../services/api';

const RecruiterDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-internships'],
    queryFn: async () => { const { data } = await api.get('/internships'); return data.data; },
  });

  if (isLoading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const internships = data?.internships || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Recruiter Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your internship postings</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Postings', value: internships.length, icon: Briefcase, color: 'emerald' },
          { label: 'Published', value: internships.filter(i => i.status === 'Published').length, icon: Eye, color: 'blue' },
          { label: 'Drafts', value: internships.filter(i => i.status === 'Draft').length, icon: Users, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-900 border border-slate-800/60 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internship List */}
      {internships.length === 0 ? (
        <div className="text-center py-16"><Briefcase size={40} className="mx-auto text-slate-600" /><p className="text-slate-400 mt-3">No postings yet</p></div>
      ) : (
        <div className="bg-surface-900 border border-slate-800/60 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-800/60 text-left">
              <th className="px-5 py-3 text-xs font-medium text-slate-400">Title</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400 hidden sm:table-cell">Location</th>
              <th className="px-5 py-3 text-xs font-medium text-slate-400">Status</th>
            </tr></thead>
            <tbody>
              {internships.map((item) => (
                <tr key={item._id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/internships/${item._id}`} className="font-medium text-white hover:text-emerald-400 transition-colors">{item.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">{item.category}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-400 hidden sm:table-cell">{item.location}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${item.status === 'Published' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
