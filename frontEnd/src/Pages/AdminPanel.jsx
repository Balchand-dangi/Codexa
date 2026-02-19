import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BiSearch } from 'react-icons/bi';
import { HiX } from 'react-icons/hi';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('stats');
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

  // Redirect if not admin
  if (!user || user.role !== 'admin') return <Navigate to="/Home" />;

  useEffect(() => {
    if (activeTab === 'users') fetchUsers(1, userSearch);
    if (activeTab === 'projects') fetchProjects(1, projectSearch);
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

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

  const handleUsersPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= usersPagination.totalPages) fetchUsers(newPage, userSearch);
  };

  const handleProjectsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= projectsPagination.totalPages) fetchProjects(newPage, projectSearch);
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
      fetchUsers(usersPagination.currentPage, userSearch);
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

  // ─── Inline loading spinner (doesn't unmount search input) ──────────────
  const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-400 font-medium">Loading...</p>
    </div>
  );

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
                      <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-violet-400 rounded-full" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</p>
                    <p className="text-sm text-slate-400 font-medium">{card.label}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Users Tab ──────────────────────────────────── */}
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
              {/* Search bar — ALWAYS mounted so it keeps focus during loading */}
              <div className="mb-5">
                <div className="relative max-w-md">
                  <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search projects by title, email, category..."
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
                {projectSearch && (
                  <p className="text-slate-500 text-xs mt-2">
                    Results for <span className="text-violet-400">"{projectSearch}"</span>
                    {' '}· {projectsPagination.totalCount} found
                  </p>
                )}
              </div>

              {/* Grid swaps to spinner during load — input stays above */}
              {loading ? <Spinner /> : (
                <>
                  <div className="grid gap-4">
                    {projects.map((project, index) => (
                      <div key={project._id} className="border border-slate-700 rounded-xl p-4 bg-slate-700/20 hover:bg-slate-700/30 transition">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded flex-shrink-0">
                                #{(projectsPagination.currentPage - 1) * 20 + index + 1}
                              </span>
                              <h3 className="font-bold text-white truncate">{project.title}</h3>
                              {project.category && (
                                <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 text-sm rounded-full border border-violet-500/20">
                                  {Array.isArray(project.category) ? project.category[0] : project.category}
                                </span>
                              )}
                              <span className='text-violet-300 text-sm'>📅 {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-300/90 mb-3 line-clamp-2">{project.description}</p>

                            {/* Meta row */}
                            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-400 mb-3">
                              👤Team leader:<span className="text-slate-300">{project.email}</span>
                              
                              
                            </div>

                            {/* Tech stack */}
                            { /* project.techStack?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {project.techStack.map(t => (
                                  <span key={t} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full border border-slate-600">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) */}

                            {/* Team Members */}
                            <div className="mt-1">
                              <p className="text-xs font-semibold text-slate-100 mb-1.5">
                                👥 Team Members
                                <span className="ml-1.5 bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-xs">
                                  {project.teamMembers?.length || 0}
                                </span>
                              </p>
                              {project.teamMembers?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {project.teamMembers.map((member, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-slate-700/60 border border-slate-600/60 rounded-lg px-2.5 py-1.5">
                                      <div className="w-5 h-5 rounded-full bg-violet-500/30 flex items-center justify-center text-violet-300 text-xs  flex-shrink-0">
                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                      </div>
                                      <div>
                                        <p className="text-xs font-semibold text-white/80 leading-tight">{member.name}</p>
                                        <p className="text-[10px] text-slate-300 leading-tight">{member.email}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Solo project — no collaborators</p>
                              )}
                            </div>
                          </div>

                          <button onClick={() => deleteProject(project._id, project.title)}
                            className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition text-sm font-semibold">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {projects.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg">
                        {projectSearch ? `No projects found for "${projectSearch}"` : 'No projects found'}
                      </p>
                    </div>
                  )}

                  <PaginationControls
                    currentPage={projectsPagination.currentPage}
                    totalPages={projectsPagination.totalPages}
                    totalCount={projectsPagination.totalCount}
                    onPageChange={handleProjectsPageChange}
                    itemName="projects"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
