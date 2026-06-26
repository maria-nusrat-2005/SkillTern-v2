import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star, 
  MessageSquare, 
  ShieldAlert, 
  Lock, 
  Loader, 
  Send, 
  CornerDownRight, 
  X 
} from 'lucide-react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

const statusConfig = {
  'Applied': { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: FileText },
  'Under Review': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  'Shortlisted': { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  'Accepted': { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: CheckCircle },
  'Completed': { color: 'text-teal-400 bg-teal-500/10 border-teal-500/20', icon: CheckCircle },
  'Rejected': { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle },
};

// Sub-component for each application row to isolate rating status query lifecycle
const ApplicationRow = ({ app, user }) => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [validationError, setValidationError] = useState('');

  const cfg = statusConfig[app.status] || statusConfig['Applied'];
  const Icon = cfg.icon;

  const isCompleted = app.status === 'Completed';
  const studentId = user.role === 'student' ? user.id : app.studentId?._id;

  // Query double-blind status if completed
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['ratingStatus', app._id],
    queryFn: async () => {
      const { data } = await api.get(`/ratings/status?internshipId=${app.internshipId._id}&studentId=${studentId}`);
      return data.data;
    },
    enabled: isCompleted && !!studentId && !!app.internshipId?._id,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/ratings', payload);
      return data;
    },
    onSuccess: () => {
      setModalOpen(false);
      setReview('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['ratingStatus', app._id] });
    },
    onError: (error) => {
      setValidationError(error.response?.data?.message || 'Failed to submit review.');
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/applications/withdraw/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });

  const canWithdraw = user.role === 'student' && ['Applied', 'Under Review', 'Shortlisted'].includes(app.status);

  const handleOpenModal = () => {
    setValidationError('');
    setModalOpen(true);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setValidationError('Please select a rating between 1 and 5.');
      return;
    }

    const revieweeId = user.role === 'student' 
      ? app.internshipId.recruiterId 
      : app.studentId?._id;

    submitReviewMutation.mutate({
      internshipId: app.internshipId._id,
      revieweeId,
      rating,
      review
    });
  };

  // Determine review state flags
  const hasReviewed = user.role === 'student' 
    ? statusData?.studentReviewed 
    : statusData?.recruiterReviewed;

  const partnerReviewed = user.role === 'student' 
    ? statusData?.recruiterReviewed 
    : statusData?.studentReviewed;

  const bothReviewed = statusData?.studentReviewed && statusData?.recruiterReviewed;

  return (
    <div className="bg-surface-900 border border-slate-800/60 rounded-xl p-5 hover:border-slate-700/60 transition-all flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">
            {user?.role === 'recruiter'
              ? `${app.studentId?.name || 'Candidate'} - ${app.internshipId?.title || 'Internship'}`
              : app.internshipId?.title || 'Internship'
            }
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'recruiter'
              ? app.studentId?.email
              : `${app.internshipId?.location} • ${app.internshipId?.category}`
            }
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canWithdraw && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to withdraw this application?')) {
                  withdrawMutation.mutate(app._id);
                }
              }}
              disabled={withdrawMutation.isPending}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {withdrawMutation.isPending ? (
                <Loader size={10} className="animate-spin" />
              ) : (
                <XCircle size={10} />
              )}
              Withdraw
            </button>
          )}
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${cfg.color}`}>
            <Icon size={12} />
            {app.status}
          </span>
        </div>
      </div>

      {/* Review Actions Section */}
      {isCompleted && (
        <div className="border-t border-slate-800/60 pt-4 mt-1">
          {isLoadingStatus ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader size={12} className="animate-spin" />
              Checking review status...
            </div>
          ) : (
            <div className="space-y-3">
              {/* Unsubmitted Review Case */}
              {!hasReviewed && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-850/40 border border-slate-800/60 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <MessageSquare size={14} className="text-emerald-400" />
                    <span>Rate your internship experience to unlock peer feedback.</span>
                  </div>
                  <button
                    onClick={handleOpenModal}
                    className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-emerald-500/10"
                  >
                    Write a Review
                  </button>
                </div>
              )}

              {/* Submitted & Locked Case */}
              {hasReviewed && !bothReviewed && (
                <div className="flex items-center gap-3 bg-slate-850/40 border border-slate-800/60 p-3.5 rounded-xl text-xs text-slate-300">
                  <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                    <Lock size={14} />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Review submitted!</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Feedback is double-blind. Ratings will unlock once the {user.role === 'student' ? 'recruiter' : 'candidate'} submits their review.
                    </p>
                  </div>
                </div>
              )}

              {/* Unlocked & Active Feedback View */}
              {bothReviewed && (
                <div className="bg-slate-850/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={13} className="text-emerald-400" />
                    Unlocked Feedback
                  </div>

                  {/* Rating received */}
                  {user.role === 'student' && statusData.recruiterReview && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Company Feedback for You:</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < statusData.recruiterReview.rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-700'} 
                            />
                          ))}
                        </div>
                      </div>
                      {statusData.recruiterReview.review && (
                        <p className="text-xs text-white leading-relaxed pl-3.5 border-l border-slate-700 py-0.5">
                          "{statusData.recruiterReview.review}"
                        </p>
                      )}
                    </div>
                  )}

                  {user.role === 'recruiter' && statusData.studentReview && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Student Feedback for Company:</span>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < statusData.studentReview.rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-700'} 
                            />
                          ))}
                        </div>
                      </div>
                      {statusData.studentReview.review && (
                        <p className="text-xs text-white leading-relaxed pl-3.5 border-l border-slate-700 py-0.5">
                          "{statusData.studentReview.review}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {user.role === 'student' ? 'Review Internship Experience' : 'Rate Candidate'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Star selector */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Rating Score</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="text-slate-500 hover:scale-110 transition-transform"
                    >
                      <Star 
                        size={28} 
                        className={starVal <= rating ? 'fill-emerald-400 text-emerald-400' : 'text-slate-700'} 
                      />
                    </button>
                  ))}
                  <span className="text-xs text-slate-400 font-semibold ml-2">({rating} of 5)</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Review Feedback Description</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={user.role === 'student' 
                    ? "What did you learn? How was the mentorship and support?" 
                    : "Describe the candidate's core accomplishments and workplace performance."
                  }
                  rows={4}
                  className="w-full bg-slate-850 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none transition-all"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15"
                >
                  {submitReviewMutation.isPending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicationsPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => { 
      const { data } = await api.get('/applications'); 
      return data.data; 
    },
  });

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
      Failed to load applications.
    </div>
  );

  const apps = data?.applications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {user?.role === 'recruiter' ? 'Candidate Applications' : 'My Applications'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.role === 'recruiter' ? 'Review candidates and manage internship feedback cycles.' : 'Track your application statuses and review completed internships.'}
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-16">
          <FileText size={40} className="mx-auto text-slate-600" />
          <p className="text-slate-400 mt-3">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <ApplicationRow key={app._id} app={app} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
