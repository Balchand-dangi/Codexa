import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/Home" />;
  }

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchProjects();
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/stats', { withCredentials: true });
      setStats(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/projects', { withCredentials: true });
      setProjects(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their projects.')) return;
    
    try {
      await axios.delete(`/api/admin/users/${userId}`, { withCredentials: true });
      alert('User deleted successfully');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await axios.delete(`/api/admin/projects/${projectId}`, { withCredentials: true });
      alert('Project deleted successfully');
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 pt-20 px-3 sm:px-4 md:px-6 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive text size */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 md:mb-8 text-center">
          Admin Panel
        </h1>

        {/* Tabs - Mobile: Stacked, Desktop: Horizontal */}
        <div className="bg-white rounded-lg shadow-lg mb-6 p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition text-sm sm:text-base ${
                activeTab === 'stats'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition text-sm sm:text-base ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👥 Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition text-sm sm:text-base ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📁 Projects ({projects.length})
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-3"></div>
              <p className="text-gray-600 font-semibold">Loading...</p>
            </div>
          )}

          {/* Stats Tab - Responsive Grid */}
          {!loading && activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
                <p className="text-xs sm:text-sm opacity-90 mb-2">Total Users</p>
                <p className="text-3xl sm:text-4xl font-bold">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
                <p className="text-xs sm:text-sm opacity-90 mb-2">Total Projects</p>
                <p className="text-3xl sm:text-4xl font-bold">{stats.totalProjects || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
                <p className="text-xs sm:text-sm opacity-90 mb-2">Total Comments</p>
                <p className="text-3xl sm:text-4xl font-bold">{stats.totalComments || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
                <p className="text-xs sm:text-sm opacity-90 mb-2">Total Likes</p>
                <p className="text-3xl sm:text-4xl font-bold">{stats.totalLikes || 0}</p>
              </div>
            </div>
          )}

          {/* Users Tab - Mobile: Cards, Desktop: Table */}
          {!loading && activeTab === 'users' && (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Verified</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-3 px-4 font-semibold text-gray-800">{u.name}</td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.isVerified ? (
                            <span className="text-green-600 font-semibold">✓ Yes</span>
                          ) : (
                            <span className="text-red-600 font-semibold">✗ No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Visible only on mobile/tablet */}
              <div className="lg:hidden space-y-4">
                {users.map((u) => (
                  <div key={u._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{u.name}</h3>
                        <p className="text-sm text-gray-600 break-all">{u.email}</p>
                      </div>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-sm mb-3">
                      <span className={u.isVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {u.isVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                      <span className="text-gray-600">
                        📅 {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Projects Tab - Responsive Cards */}
          {!loading && activeTab === 'projects' && (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2">{project.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      
                      {/* Project Details - Stack on mobile, inline on desktop */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span>👤</span>
                          <span className="truncate">{project.name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📧</span>
                          <span className="truncate">{project.email}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="w-full sm:w-auto sm:ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold whitespace-nowrap"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && activeTab === 'users' && users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}

          {!loading && activeTab === 'projects' && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
