import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  TrendingUp, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowRight,
  Loader,
  Bookmark,
  Bell,
  History,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' or 'bookmarks'
  const [filters, setFilters] = useState({ search: '', location: '', internshipType: '' });
  const [page, setPage] = useState(1);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Fetch explore internships list
  const { data: exploreData, isLoading: isLoadingExplore, error: exploreError } = useQuery({
    queryKey: ['internships', filters, page, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 9 });
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.internshipType) params.append('internshipType', filters.internshipType);
      const { data } = await api.get(`/internships?${params}`);
      return data.data;
    },
    enabled: activeTab === 'explore',
  });

  // Fetch bookmarked internships list
  const { data: bookmarkData = [], isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/bookmarks');
      return data.data;
    },
    enabled: user?.role === 'student',
  });

  // Fetch detailed match analysis on drawer open
  const { data: matchAnalysis, isLoading: isLoadingAnalysis, error: analysisError } = useQuery({
    queryKey: ['matchAnalysis', selectedMatchId],
    queryFn: async () => {
      if (!selectedMatchId) return null;
      const { data } = await api.get(`/matches/${selectedMatchId}`);
      return data.data;
    },
    enabled: !!selectedMatchId,
  });

  // Fetch historical recommendations log
  const { data: recHistory = [] } = useQuery({
    queryKey: ['recHistory', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/recommendations/history');
      return data.data;
    },
    enabled: user?.role === 'student' && historyOpen,
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.data;
    },
    enabled: user?.role === 'student',
  });

  // Bookmark toggler mutations
  const addBookmarkMutation = useMutation({
    mutationFn: async (internshipId) => {
      await api.post('/bookmarks', { internshipId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks']);
      queryClient.invalidateQueries(['internships']);
    }
  });

  const deleteBookmarkMutation = useMutation({
    mutationFn: async (bookmarkId) => {
      await api.delete(`/bookmarks/${bookmarkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookmarks']);
      queryClient.invalidateQueries(['internships']);
    }
  });

  // Notifications update mutations
  const readAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleBookmarkToggle = (internshipId) => {
    const existingBookmark = bookmarkData.find(b => b.internshipId?._id === internshipId);
    if (existingBookmark) {
      deleteBookmarkMutation.mutate(existingBookmark._id);
    } else {
      addBookmarkMutation.mutate(internshipId);
    }
  };

  const isBookmarked = (internshipId) => {
    return bookmarkData.some(b => b.internshipId?._id === internshipId);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="relative min-h-screen space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Discover Opportunities <Sparkles size={20} className="text-emerald-400 font-bold" />
          </h1>
          <p className="text-slate-400 text-sm mt-1">Find internships matched precisely to your skill profile and interests</p>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-slate-800/40 p-1 border border-slate-700/50 rounded-xl max-w-sm shrink-0">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'explore' 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explore Feed
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks' 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark size={12} />
            Bookmarks ({bookmarkData.length})
          </button>
        </div>
      </div>

      {/* Notifications Hub Banner */}
      {unreadNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start sm:items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <Bell size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Unread Alerts Inbox ({unreadNotifications.length})</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans leading-normal">
                "{unreadNotifications[0].title}: {unreadNotifications[0].message}"
              </p>
            </div>
          </div>
          <button 
            onClick={() => readAllNotificationsMutation.mutate()}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline whitespace-nowrap"
          >
            Mark all read
          </button>
        </div>
      )}

      {/* Filters Bar (Only shown for explore tab) */}
      {activeTab === 'explore' && (
        <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title, skills or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Location..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/60 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
              />
            </div>
            <select
              name="internshipType"
              value={filters.internshipType}
              onChange={handleFilterChange}
              className="sm:w-40 py-2 px-3 bg-slate-800/50 border border-slate-700/60 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            >
              <option value="">All Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid Content */}
      {activeTab === 'explore' ? (
        <>
          {isLoadingExplore && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {exploreError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
              Failed to load internships. Make sure the API server is running.
            </div>
          )}

          {exploreData && (
            <>
              {exploreData.internships?.length === 0 ? (
                <div className="text-center py-16 space-y-3 bg-surface-900 border border-slate-800/60 rounded-xl">
                  <Briefcase size={40} className="mx-auto text-slate-600 animate-pulse" />
                  <p className="text-slate-400">No internships found matching your criteria</p>
                  <p className="text-xs text-slate-500">Try adjusting your search filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
                  {exploreData.internships?.map((internship) => (
                    <div
                      key={internship._id}
                      className="group bg-surface-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Title + Bookmark Button */}
                        <div className="flex items-start justify-between gap-3">
                          <Link to={`/internships/${internship._id}`} className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {internship.title}
                          </Link>
                          <button
                            onClick={() => handleBookmarkToggle(internship._id)}
                            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                              isBookmarked(internship._id)
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                                : 'bg-slate-800 border-slate-750 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Save/Bookmark"
                          >
                            <Bookmark size={13} className={isBookmarked(internship._id) ? 'fill-emerald-400' : ''} />
                          </button>
                        </div>

                        {/* Category */}
                        <p className="text-xs text-slate-400">{internship.category}</p>

                        {/* Meta row */}
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={12} />{internship.location}</span>
                          <span className="flex items-center gap-1"><Clock size={12} />{internship.internshipType}</span>
                        </div>

                        {/* Skills tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {internship.requiredSkills?.slice(0, 4).map((skill) => (
                            <span key={skill} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-750/50">
                              {skill}
                            </span>
                          ))}
                          {internship.requiredSkills?.length > 4 && (
                            <span className="text-[10px] text-slate-500 font-medium">+{internship.requiredSkills.length - 4} more</span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-850">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500">Stipend</span>
                          <span className="text-xs text-emerald-400 font-semibold">{internship.stipend}</span>
                        </div>

                        {/* Match Score Badge */}
                        {internship.match && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedMatchId(internship._id);
                            }}
                            className={`text-xs px-2.5 py-1 rounded-full font-extrabold border flex items-center gap-1 transition-all hover:scale-105 duration-200 ${
                              internship.match.score >= 75
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : internship.match.score >= 40
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                          >
                            <Sparkles size={11} />
                            {internship.match.score}% Match
                          </button>
                        )}

                        <Link to={`/internships/${internship._id}`} className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          View <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {exploreData.pagination && exploreData.pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  {Array.from({ length: exploreData.pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-755'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Bookmarked listings grid */
        <>
          {isLoadingBookmarks && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {bookmarkData.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-surface-900 border border-slate-800/60 rounded-xl">
              <Bookmark size={40} className="mx-auto text-slate-600" />
              <p className="text-slate-400">No bookmarked internships found</p>
              <p className="text-xs text-slate-500">Bookmark interesting positions while exploring the explore feed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
              {bookmarkData.map((bookmark) => {
                const internship = bookmark.internshipId;
                if (!internship) return null;
                return (
                  <div
                    key={bookmark._id}
                    className="group bg-surface-900 border border-slate-800/60 rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/internships/${internship._id}`} className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {internship.title}
                        </Link>
                        <button
                          onClick={() => handleBookmarkToggle(internship._id)}
                          className="p-1.5 rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20 shrink-0"
                          title="Unsave"
                        >
                          <Bookmark size={13} className="fill-emerald-400" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400">{internship.category}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={12} />{internship.location}</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{internship.internshipType}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-850">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500">Stipend</span>
                        <span className="text-xs text-emerald-400 font-semibold">{internship.stipend}</span>
                      </div>
                      <Link to={`/internships/${internship._id}`} className="text-xs text-slate-500 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                        View <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Recommendation History Accordion Widget */}
      <div className="bg-surface-900 border border-slate-800/60 rounded-xl overflow-hidden mt-8">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
        >
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <History size={16} className="text-emerald-400" />
            Recommendation History Log
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
            {historyOpen ? 'Hide History' : 'Show Logs'}
            <ArrowRight size={12} className={`transform transition-transform duration-200 ${historyOpen ? 'rotate-90' : ''}`} />
          </span>
        </button>

        {historyOpen && (
          <div className="p-6 border-t border-slate-800/60 space-y-4 bg-slate-900/10 animate-slide-up">
            {recHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">No recommendation log events found.</p>
            ) : (
              <div className="space-y-4">
                {recHistory.map((item, idx) => (
                  <div key={item._id || idx} className="p-4 bg-slate-850/50 border border-slate-800/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Logged: {new Date(item.generatedDate).toLocaleDateString()}</span>
                      <span className="text-[10px] bg-slate-800 border border-slate-750 text-slate-400 px-2 py-0.5 rounded font-bold">
                        {item.recommendedInternships?.length || 0} Matches
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.recommendedInternships?.map((recItem, rIdx) => (
                        <div key={recItem._id || rIdx} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg border border-slate-800/40">
                          <span className="text-xs text-white font-medium truncate max-w-[150px]">
                            {recItem.internshipId?.title || 'Unknown Position'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {recItem.score}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Recommendation slide-out drawer */}
      {selectedMatchId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedMatchId(null)} />

          <div className="relative w-full max-w-md bg-surface-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between animate-slide-up z-10">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-400 animate-pulse" size={18} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Match Scoring Breakdown</h2>
              </div>
              <button 
                onClick={() => setSelectedMatchId(null)} 
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingAnalysis && (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <Loader className="text-emerald-400 animate-spin" size={24} />
                  <p className="text-xs text-slate-400 font-semibold">Running matching engines...</p>
                </div>
              )}

              {analysisError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
                  Failed to load match breakdown.
                </div>
              )}

              {matchAnalysis && (
                <div className="space-y-6">
                  {/* Score circle layout */}
                  <div className="flex flex-col items-center text-center p-5 bg-slate-850/50 border border-slate-800/80 rounded-2xl">
                    <div className="relative flex items-center justify-center w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="currentColor" 
                          className="text-slate-800" 
                          strokeWidth="8" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="currentColor" 
                          className={
                            matchAnalysis.score >= 75
                              ? 'text-emerald-500'
                              : matchAnalysis.score >= 40
                              ? 'text-amber-500'
                              : 'text-red-500'
                          } 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={((100 - matchAnalysis.score) / 100) * (2 * Math.PI * 40)}
                        />
                      </svg>
                      <span className="absolute text-xl font-extrabold text-white">
                        {matchAnalysis.score}%
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300 mt-3">Calculated Compatibility Match</span>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed px-2 font-sans">
                      {matchAnalysis.explanation || matchAnalysis.recommendationReason}
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills Matching</h3>
                    
                    {/* Matched Skills */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span className="text-xs text-slate-400">Matched Skills ({matchAnalysis.matchedSkills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-4">
                        {matchAnalysis.matchedSkills?.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">None matched</span>
                        ) : (
                          matchAnalysis.matchedSkills?.map(s => (
                            <span key={s} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <AlertCircle size={12} className="text-red-500" />
                        <span className="text-xs text-slate-400">Missing Skills ({matchAnalysis.missingSkills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-4">
                        {matchAnalysis.missingSkills?.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">Perfect match! No missing skills</span>
                        ) : (
                          matchAnalysis.missingSkills?.map(s => (
                            <span key={s} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded font-medium">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skill Gap Analysis / Learning Paths */}
                  {matchAnalysis.improvementSuggestions?.length > 0 && (
                    <div className="space-y-3 border-t border-slate-800 pt-4">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={13} className="text-emerald-400 animate-pulse" />
                        Tutorials & Course Suggestions
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-normal font-sans">
                        Learn these skills to increase your compatibility score:
                      </p>

                      <div className="space-y-3 pt-1">
                        {matchAnalysis.improvementSuggestions.map((item) => (
                          <div key={item.skill} className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-white">{item.skill}</span>
                              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                +{item.potentialBoost || item.improvementValue}% Boost
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-sans">
                              Study the {item.skill} documentation and complete courses to fulfill recruiter requirements.
                            </p>
                            <a
                              href={item.resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold pt-1 transition-colors"
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
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-2">
              <button 
                onClick={() => setSelectedMatchId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-750"
              >
                Close Explanation
              </button>
              {selectedMatchId && (
                <Link
                  to={`/internships/${selectedMatchId}`}
                  onClick={() => setSelectedMatchId(null)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg text-center transition-all shadow-lg shadow-emerald-500/15"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
