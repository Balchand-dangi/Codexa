import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Navigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { HiX } from 'react-icons/hi';

const initialStageForm = {
  title: '',
  description: '',
  guidelines: '',
  timelineType: 'range',
  startDate: '',
  endDate: '',
  durationDays: '',
  marks: ''
};

const stageTimelineLabel = (stage) => {
  if (stage.timelineType === 'duration') {
    return `${stage.durationDays} day(s)`;
  }
  const start = stage.startDate ? new Date(stage.startDate).toLocaleDateString() : 'N/A';
  const end = stage.endDate ? new Date(stage.endDate).toLocaleDateString() : 'N/A';
  return `${start} -> ${end}`;
};

const AdminPanel = ({ user }) => {
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('stats');
  const [projectSubTab, setProjectSubTab] = useState('all-projects');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const userDebounceRef = useRef(null);
  const projectDebounceRef = useRef(null);

  // Pagination states
  const [usersPagination, setUsersPagination] = useState({ currentPage: 1, totalPages: 0, totalCount: 0 });
  const [projectsPagination, setProjectsPagination] = useState({ currentPage: 1, totalPages: 0, totalCount: 0 });
  const [stages, setStages] = useState([]);
  const [stageVersion, setStageVersion] = useState(1);
  const [stageForm, setStageForm] = useState(initialStageForm);
  const [editingStageId, setEditingStageId] = useState(null);
  const [stageSaving, setStageSaving] = useState(false);
  const [stageReorderSaving, setStageReorderSaving] = useState(false);
  const [dragStageId, setDragStageId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState({});

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'users') fetchUsers(1, userSearch);
    if (activeTab === 'projects') {
      if (projectSubTab === 'all-projects') {
        fetchProjects(1, projectSearch);
      } else {
        fetchProjectStages();
        fetchReviewQueue();
      }
    }
    if (activeTab === 'stats') fetchStats();
  }, [activeTab, projectSubTab, isAdmin]);

  // Debounced user search — fires only when ≥2 chars, 700ms pause
  const handleUserSearch = useCallback((term) => {
    setUserSearch(term);
    if (userDebounceRef.current) clearTimeout(userDebounceRef.current);
    if (!term.trim()) { fetchUsers(1, ''); return; }
    if (term.trim().length < 2) return;
    userDebounceRef.current = setTimeout(() => { fetchUsers(1, term.trim()); }, 700);
  }, []);

  // Debounced project search — fires only when ≥2 chars, 700ms pause
  const handleProjectSearch = useCallback((term) => {
    setProjectSearch(term);
    if (projectDebounceRef.current) clearTimeout(projectDebounceRef.current);
    if (!term.trim()) { fetchProjects(1, ''); return; }
    if (term.trim().length < 2) return;
    projectDebounceRef.current = setTimeout(() => { fetchProjects(1, term.trim()); }, 700);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/stats', { withCredentials: true });
      setStats(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch stats');
    } finally { setLoading(false); }
  };

  const fetchUsers = async (page, search = '') => {
    setLoading(true);
    try {
      let url = `/api/admin/users?page=${page}&limit=20`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await axios.get(url, { withCredentials: true });
      setUsers(res.data.data);
      setUsersPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.totalPages,
        totalCount: res.data.pagination.totalCount
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users');
    } finally { setLoading(false); }
  };

  const fetchProjects = async (page, search = '') => {
    setLoading(true);
    try {
      let url = `/api/admin/projects?page=${page}&limit=20`;
      if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const res = await axios.get(url, { withCredentials: true });
      setProjects(res.data.data);
      setProjectsPagination({
        currentPage: res.data.pagination.currentPage,
        totalPages: res.data.pagination.totalPages,
        totalCount: res.data.pagination.totalCount
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch projects');
    } finally { setLoading(false); }
  };

  const fetchProjectStages = async () => {
    try {
      const res = await axios.get('/api/admin/project-stages', { withCredentials: true });
      setStages(res.data?.stages || []);
      setStageVersion(res.data?.version || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch project stages');
    }
  };

  const fetchReviewQueue = async () => {
    setReviewsLoading(true);
    try {
      const res = await axios.get('/api/admin/stage-submissions?status=pending', { withCredentials: true });
      setReviews(res.data?.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load review queue');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleUsersPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= usersPagination.totalPages) fetchUsers(newPage, userSearch);
  };

  const handleProjectsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= projectsPagination.totalPages) fetchProjects(newPage, projectSearch);
  };

  const resetStageForm = () => {
    setStageForm(initialStageForm);
    setEditingStageId(null);
  };

  const beginEditStage = (stage) => {
    setEditingStageId(stage.stageId);
    setStageForm({
      title: stage.title || '',
      description: stage.description || '',
      guidelines: stage.guidelines || '',
      timelineType: stage.timelineType || 'range',
      startDate: stage.startDate ? new Date(stage.startDate).toISOString().slice(0, 10) : '',
      endDate: stage.endDate ? new Date(stage.endDate).toISOString().slice(0, 10) : '',
      durationDays: stage.durationDays ?? '',
      marks: stage.marks ?? ''
    });
  };

  const submitStage = async (e) => {
    e.preventDefault();
    setStageSaving(true);
    try {
      const payload = {
        title: stageForm.title.trim(),
        description: stageForm.description.trim(),
        guidelines: stageForm.guidelines.trim(),
        timelineType: stageForm.timelineType,
        startDate: stageForm.timelineType === 'range' ? stageForm.startDate : null,
        endDate: stageForm.timelineType === 'range' ? stageForm.endDate : null,
        durationDays: stageForm.timelineType === 'duration' ? Number(stageForm.durationDays) : null,
        marks: Number(stageForm.marks)
      };

      if (editingStageId) {
        await axios.put(`/api/admin/project-stages/${editingStageId}`, payload, { withCredentials: true });
        toast.success('Stage updated');
      } else {
        await axios.post('/api/admin/project-stages', payload, { withCredentials: true });
        toast.success('Stage created');
      }

      resetStageForm();
      fetchProjectStages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stage');
    } finally {
      setStageSaving(false);
    }
  };

  const deleteStage = async (stageId) => {
    try {
      await axios.delete(`/api/admin/project-stages/${stageId}`, { withCredentials: true });
      toast.success('Stage deleted');
      if (editingStageId === stageId) resetStageForm();
      fetchProjectStages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete stage');
    }
  };

  const reorderLocalStages = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    const next = [...stages];
    const fromIndex = next.findIndex(s => s.stageId === fromId);
    const toIndex = next.findIndex(s => s.stageId === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setStages(next.map((stage, idx) => ({ ...stage, order: idx })));
  };

  const saveReorder = async () => {
    setStageReorderSaving(true);
    try {
      await axios.patch('/api/admin/project-stages/reorder', { orderedStageIds: stages.map(stage => stage.stageId) }, { withCredentials: true });
      toast.success('Stage order saved');
      fetchProjectStages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order');
    } finally {
      setStageReorderSaving(false);
    }
  };

  const reviewAction = async (review, action) => {
    try {
      if (action === 'approve') {
        await axios.patch(`/api/admin/stage-submissions/${review.projectId}/${review.stageId}/approve`, {}, { withCredentials: true });
      } else {
        await axios.patch(
          `/api/admin/stage-submissions/${review.projectId}/${review.stageId}/reject`,
          { feedback: reviewFeedback[`${review.projectId}-${review.stageId}`] || '' },
          { withCredentials: true }
        );
      }
      toast.success(`Submission ${action}d`);
      fetchReviewQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} submission`);
    }
  };

  // Delete with descriptive confirmation — shows the user/project name
  const deleteUser = async (userId, userName) => {
    const confirmed = await new Promise(resolve => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-slate-800">Delete user?</p>
          <p className="text-sm text-slate-500">
            This will permanently delete <span className="font-bold text-red-600">{userName}</span> and all their projects, comments, and likes.
          </p>
          <div className="flex gap-2">
            <button onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">
              Yes, Delete
            </button>
            <button onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`, { withCredentials: true });
      toast.success('User deleted successfully');
      // Optimistically remove from local state immediately
      setUsers(prev => prev.filter(u => u._id !== userId));
      setUsersPagination(prev => ({ ...prev, totalCount: Math.max(0, prev.totalCount - 1) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteProject = async (projectId, projectTitle) => {
    const confirmed = await new Promise(resolve => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-slate-800">Delete project?</p>
          <p className="text-sm text-slate-600">
            "<span className="font-bold text-red-600">{projectTitle}</span>" will be permanently removed along with all its comments and likes.
          </p>
          <div className="flex gap-2">
            <button onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">
              Yes, Delete
            </button>
            <button onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    });
    if (!confirmed) return;
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, { withCredentials: true });
      toast.success('Project deleted successfully');
      // Optimistically remove from local state immediately
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setProjectsPagination(prev => ({ ...prev, totalCount: Math.max(0, prev.totalCount - 1) }));
      fetchProjects(projectsPagination.currentPage, projectSearch);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...'); pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1); pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1); pages.push('...');
        pages.push(currentPage - 1); pages.push(currentPage); pages.push(currentPage + 1);
        pages.push('...'); pages.push(totalPages);
      }
    }
    return pages;
  };

  const PaginationControls = ({ currentPage, totalPages, totalCount, onPageChange, itemName }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm">
            ← Prev
          </button>
          {getPageNumbers(currentPage, totalPages).map((page, index) =>
            page === '...' ? (
              <span key={`e-${index}`} className="px-3 py-2 text-slate-500">...</span>
            ) : (
              <button key={page} onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${currentPage === page ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {page}
              </button>
            )
          )}
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm">
            Next →
          </button>
        </div>
        <div className="text-center text-slate-500 text-sm">
          Page {currentPage} of {totalPages} · {totalCount} total {itemName}
        </div>
      </div>
    );
  };

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥' },
    { label: 'Total Projects', value: stats.totalProjects || 0, icon: '📁' },
    { label: 'Total Comments', value: stats.totalComments || 0, icon: '💬' },
    { label: 'Total Likes', value: stats.totalLikes || 0, icon: '❤️' },
  ];

  // ─── Inline loading spinner (doesn't unmount search input) 
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-400 font-medium">Loading...</p>
    </div>
  );

  if (!isAdmin) return <Navigate to="/Home" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 px-3 sm:px-4 md:px-6 pb-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage users, projects, and platform statistics</p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-xl mb-6 p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { id: 'stats', label: '📊 Statistics' },
              { id: 'users', label: `👥 Users${usersPagination.totalCount > 0 ? ` (${usersPagination.totalCount})` : ''}` },
              { id: 'projects', label: `📁 Projects${projectsPagination.totalCount > 0 ? ` (${projectsPagination.totalCount})` : ''}` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition text-sm ${activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-xl p-4 sm:p-6">

          {/* ── Stats Tab ──────────────────────────────────── */}
          {activeTab === 'stats' && (
            loading ? <Spinner /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((card) => (
                  <div key={card.label} className="bg-slate-700/50 border border-slate-600/50 rounded-2xl p-6 hover:bg-slate-700/70 transition">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-slate-400 font-medium">{card.label}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Users Tab  */}
          {activeTab === 'users' && (
            <>
              {/* Search bar — ALWAYS mounted so it keeps focus during loading */}
              <div className="mb-5">
                <div className="relative max-w-md">
                  <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm"
                  />
                  {userSearch && (
                    <button onClick={() => { setUserSearch(''); fetchUsers(1, ''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                      <HiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {userSearch && (
                  <p className="text-slate-500 text-xs mt-2">
                    Results for <span className="text-violet-400">"{userSearch}"</span>
                    {' '}· {usersPagination.totalCount} found
                  </p>
                )}
              </div>

              {/* Table/cards swap to spinner during load — input stays above */}
              {loading ? <Spinner /> : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-700">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-700/50">
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">#</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">Verified</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-300 text-sm">Joined</th>
                          <th className="text-center py-3 px-4 font-semibold text-slate-300 text-sm">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, index) => (
                          <tr key={u._id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition">
                            <td className="py-3 px-4 text-slate-400 font-semibold text-sm">
                              {(usersPagination.currentPage - 1) * 20 + index + 1}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                            <td className="py-3 px-4 text-slate-400 text-sm">{u.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-slate-600/50 text-slate-300 border border-slate-600'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {u.isVerified
                                ? <span className="text-emerald-400 font-semibold text-sm">✓ Yes</span>
                                : <span className="text-red-400 font-semibold text-sm">✗ No</span>}
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-center">
                              {u.role !== 'admin' && (
                                <button onClick={() => deleteUser(u._id, u.name)}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition text-sm font-semibold">
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {users.map((u, index) => (
                      <div key={u._id} className="border border-slate-700 rounded-xl p-4 bg-slate-700/20 hover:bg-slate-700/30 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                              #{(usersPagination.currentPage - 1) * 20 + index + 1}
                            </span>
                            <h3 className="font-bold text-white">{u.name}</h3>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-600/50 text-slate-300'}`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 break-all mb-2">{u.email}</p>
                        <div className="flex flex-wrap gap-3 text-sm mb-3">
                          <span className={u.isVerified ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {u.isVerified ? '✓ Verified' : '✗ Not Verified'}
                          </span>
                          <span className="text-slate-500">📅 {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                        {u.role !== 'admin' && (
                          <button onClick={() => deleteUser(u._id, u.name)}
                            className="w-full px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition font-semibold text-sm">
                            Delete User
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg">
                        {userSearch ? `No users found for "${userSearch}"` : 'No users found'}
                      </p>
                    </div>
                  )}

                  <PaginationControls
                    currentPage={usersPagination.currentPage}
                    totalPages={usersPagination.totalPages}
                    totalCount={usersPagination.totalCount}
                    onPageChange={handleUsersPageChange}
                    itemName="users"
                  />
                </>
              )}
            </>
          )}

          {/* ── Projects Tab ──────────────────────────────────── */}
          {activeTab === 'projects' && (
            <>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setProjectSubTab('all-projects')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${projectSubTab === 'all-projects' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    All Projects
                  </button>
                  <button
                    onClick={() => setProjectSubTab('stages')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${projectSubTab === 'stages' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                  >
                    Stages
                  </button>
                </div>

                {projectSubTab === 'all-projects' && (
                  <div className="mb-5">
                    <div className="relative max-w-md">
                      <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => handleProjectSearch(e.target.value)}
                        className="w-full pl-11 pr-10 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition text-sm"
                      />
                      {projectSearch && (
                        <button onClick={() => { setProjectSearch(''); fetchProjects(1, ''); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {projectSubTab === 'all-projects' ? (
                loading ? <Spinner /> : (
                  <>
                    <div className="grid gap-4">
                      {projects.map((project, index) => (
                        <div
                          key={project._id}
                          className="border border-slate-700 rounded-xl p-4 bg-slate-700/20 hover:bg-slate-700/30 transition"
                        >
                          <div className="flex flex-col lg:flex-row lg:justify-between gap-5">

                            {/* LEFT SECTION */}
                            <div className="flex-1 min-w-0">

                              {/* Header Row */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                                  #{(projectsPagination.currentPage - 1) * 20 + index + 1}
                                </span>

                                <h3 className="font-bold text-white truncate max-w-full">
                                  {project.title}
                                </h3>

                                {project.category && (
                                  <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 text-xs sm:text-sm rounded-full border border-violet-500/20">
                                    {Array.isArray(project.category)
                                      ? project.category[0]
                                      : project.category}
                                  </span>
                                )}

                                <span className="text-violet-300 text-xs sm:text-sm break-words">
                                  📅 {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <p className="text-sm text-slate-300/90 mb-3 break-words line-clamp-2">
                                {project.description}
                              </p>

                              {/* Tech Stack */}
                              {project.techStack?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {project.techStack.map((t) => (
                                    <span
                                      key={t}
                                      className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600 break-words"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Meta */}
                              <div className="flex flex-wrap gap-2 text-xs text-slate-400 mb-3 break-all">
                                👤 Team leader:
                                <span className="text-slate-300">{project.email}</span>
                              </div>

                              {/* Team Members */}
                              <div className="mt-1">
                                <p className="text-xs font-semibold text-slate-100 mb-1.5 flex flex-wrap items-center gap-1">
                                  👥 Team Members
                                  <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                                    {project.teamMembers?.length || 0}
                                  </span>
                                </p>

                                {project.teamMembers?.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {project.teamMembers.map((member, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-1.5 bg-slate-700/60 border border-slate-600/60 rounded-lg px-2.5 py-1.5 max-w-full"
                                      >
                                        <div className="w-5 h-5 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 text-xs flex-shrink-0">
                                          {member.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-white/80 truncate">
                                            {member.name}
                                          </p>
                                          <p className="text-[10px] text-slate-300 truncate">
                                            {member.email}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    Solo project — no collaborators
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* RIGHT SECTION (Buttons) */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto">

                              <button
                                onClick={() => deleteProject(project._id, project.title)}
                                className="w-full lg:w-auto px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition text-sm font-semibold"
                              >
                                Delete
                              </button>

                              <Link to={`/projectStatus/${project._id}`} className="w-full lg:w-auto">
                                <button
                                  className="w-full relative px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl hover:bg-violet-500 hover:text-white hover:border-violet-500 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-violet-500/25 flex items-center justify-center gap-0.5"
                                  title="View project status"
                                >
                                  Current status
                                  <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse"></span>
                                </button>
                              </Link>

                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <PaginationControls
                      currentPage={projectsPagination.currentPage}
                      totalPages={projectsPagination.totalPages}
                      totalCount={projectsPagination.totalCount}
                      onPageChange={handleProjectsPageChange}
                      itemName="projects"
                    />
                  </>
                )
              ) : (
                projectSubTab === 'stages' && (
                  <div className="mt-8 pt-6 border-t border-slate-700/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">Project Stages</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        Workflow v{stageVersion}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                      <div className="xl:col-span-2 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold">{editingStageId ? 'Update Stage' : 'Create Stage'}</h4>
                        </div>
                        <form onSubmit={submitStage} className="space-y-3">
                          <input
                            required
                            value={stageForm.title}
                            onChange={(e) => setStageForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Stage Title"
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <textarea
                            value={stageForm.description}
                            onChange={(e) => setStageForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description"
                            className="w-full min-h-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <textarea
                            value={stageForm.guidelines}
                            onChange={(e) => setStageForm(prev => ({ ...prev, guidelines: e.target.value }))}
                            placeholder="Guidelines"
                            className="w-full min-h-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <select
                            value={stageForm.timelineType}
                            onChange={(e) => setStageForm(prev => ({ ...prev, timelineType: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                          >
                            <option value="range">Start Date -&gt; End Date</option>
                            <option value="duration">Duration</option>
                          </select>
                          {stageForm.timelineType === 'range' ? (
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={stageForm.startDate}
                                onChange={(e) => setStageForm(prev => ({ ...prev, startDate: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                required
                              />
                              <input
                                type="date"
                                value={stageForm.endDate}
                                onChange={(e) => setStageForm(prev => ({ ...prev, endDate: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                required
                              />
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={stageForm.durationDays}
                              onChange={(e) => setStageForm(prev => ({ ...prev, durationDays: e.target.value }))}
                              placeholder="Duration (days)"
                              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                              required
                            />
                          )}
                          <input
                            type="number"
                            min="0"
                            required
                            value={stageForm.marks}
                            onChange={(e) => setStageForm(prev => ({ ...prev, marks: e.target.value }))}
                            placeholder="Marks / Weightage"
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                          />
                          <div className="flex gap-2">
                            <button disabled={stageSaving} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">
                              {stageSaving ? 'Saving...' : editingStageId ? 'Update Stage' : 'Create Stage'}
                            </button>
                            {editingStageId && (
                              <button type="button" onClick={resetStageForm} className="px-4 py-2 bg-slate-700 text-slate-100 rounded-lg text-sm">
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="xl:col-span-3 space-y-4">
                        <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-white font-semibold">Defined Global Stages (drag to reorder)</h4>
                            <button onClick={saveReorder} disabled={stageReorderSaving || stages.length < 2} className="px-3 py-1.5 text-sm rounded-lg bg-violet-600 text-white disabled:opacity-50">
                              {stageReorderSaving ? 'Saving...' : 'Save Order'}
                            </button>
                          </div>
                          <div className="space-y-2 cursor-move">
                            {stages.map((stage, idx) => (
                              <div
                                key={stage.stageId}
                                draggable
                                onDragStart={() => setDragStageId(stage.stageId)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => { reorderLocalStages(dragStageId, stage.stageId); setDragStageId(null); }}
                                className="bg-slate-800 border border-slate-700 rounded-lg p-3"
                              >
                                <div className="flex items-center  justify-between gap-2">
                                  <p className="text-white font-semibold">#{idx + 1} {stage.title}</p>
                                  <div className="flex gap-2">
                                    <button onClick={() => beginEditStage(stage)} className="px-2 py-1 text-xs rounded-md bg-violet-500/20 text-violet-300">Edit</button>
                                    <button onClick={() => deleteStage(stage.stageId)} className="px-2 py-1 text-xs rounded-md bg-red-500/20 text-red-300">Delete</button>
                                  </div>
                                </div>
                                <p className="text-slate-400 text-xs mt-1">{stageTimelineLabel(stage)} | {stage.marks} marks</p>
                                <p className="text-slate-300 text-sm mt-2">{stage.description || 'No description'}</p>
                              </div>
                            ))}
                            {stages.length === 0 && <p className="text-slate-400 text-sm">No stages defined yet.</p>}
                          </div>
                        </div>

                        <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                          <h4 className="text-white font-semibold mb-3">Submission Review Panel</h4>
                          {reviewsLoading ? <p className="text-slate-400">Loading submissions...</p> : (
                            <div className="space-y-3">
                              {reviews.map(review => {
                                const reviewKey = `${review.projectId}-${review.stageId}`;
                                return (
                                  <div key={reviewKey} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                    <p className="text-white font-semibold">{review.projectTitle}</p>
                                    <p className="text-slate-300 text-sm">Stage: {review.stageTitle}</p>
                                    <p className="text-slate-400 text-xs">{review.projectOwnerEmail}</p>
                                    <img src={review.proofImage} alt="Stage proof" className="mt-2 max-h-52 rounded border border-slate-700" />
                                    <textarea
                                      value={reviewFeedback[reviewKey] || ''}
                                      onChange={(e) => setReviewFeedback(prev => ({ ...prev, [reviewKey]: e.target.value }))}
                                      placeholder="Feedback (required if rejecting)"
                                      className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white min-h-16"
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button onClick={() => reviewAction(review, 'approve')} className="px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white">
                                        Approve
                                      </button>
                                      <button onClick={() => reviewAction(review, 'reject')} className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white">
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              {reviews.length === 0 && <p className="text-slate-400 text-sm">No pending submissions.</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
