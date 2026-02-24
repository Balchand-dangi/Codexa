import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { MdOutlineInsertComment } from "react-icons/md";
import { BiLike, BiSolidLike } from "react-icons/bi";
import { BiSearch } from "react-icons/bi";
import { HiX } from "react-icons/hi";
import CollabModel from "../Components/CollabModel";
import CommentPage from "../Components/CommentPage";
import toast from "react-hot-toast";
import {motion} from "framer-motion";

const ProjectGrid = ({ user, socket }) => {
  const [projects, setProjects] = useState([])
  const [projectStats, setProjectStats] = useState({})
  const [userLikes, setUserLikes] = useState({})
  const [commentText, setCommentText] = useState({})
  const [comments, setComments] = useState({})
  const [selectedCommentProject, setSelectedCommentProject] = useState(null) // replaces showComments
  const [showCollabModal, setShowCollabModal] = useState(null)
  const [collabMessage, setCollabMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Search state
  // How search works in ProjectGrid
  // The search in ProjectGrid is frontend filtering only — no API call on search. It uses a useMemo (or filter) over the already-fetched projects array. This is fast but limited to projects already loaded. The admin panel search is different — it does a debounced API call (700ms pause, min 2 chars) with a backend query so it can search across all data with pagination.
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const searchTimeoutRef = useRef(null)

  // Pagination states
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)

  // Debounced search — 250ms, sends `search=` param to backend
  const handleSearch = useCallback((term) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    setSearchTerm(term)

    if (user && term.trim()) {
      setIsSearching(true)
      setProjects([])
      setNextCursor(null)
      setHasMore(true)
      searchTimeoutRef.current = setTimeout(() => {
        fetchProjects(null, term.trim())
      }, 250)
    } else if (user && !term.trim()) {
      setProjects([])
      setNextCursor(null)
      setHasMore(true)
      fetchProjects()
    }
  }, [user])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    setProjects([])
    setNextCursor(null)
    setHasMore(true)
    if (user) fetchProjects()
  }, [user])

  useEffect(() => {
    if (!user) { setProjects([]); return }
    fetchProjects()
  }, [user])

  useEffect(() => {
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current) }
  }, [])

  // ── Socket.IO: join project rooms when projects load ──────────────────────
  useEffect(() => {
    if (!socket || projects.length === 0) return
    projects.forEach(p => socket.emit('join-project', p._id))
    return () => {
      projects.forEach(p => socket.emit('leave-project', p._id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, projects.length])

  // ── Socket.IO: listen for real-time comment events ───────────────────────
  useEffect(() => {
    if (!socket) return

    const handleNewComment = (comment) => {
      // Skip if this is our own comment — already added via optimistic update.
      // The temp _id (Date.now()) vs real DB _id means the _id-based duplicate
      // check can't catch this case, so we filter by email instead.
      if (comment.userEmail === user?.email) return

      const pid = String(comment.projectId)
      setComments(prev => {
        const existing = prev[pid] || []
        if (existing.some(c => c._id === comment._id)) return prev
        return { ...prev, [pid]: [...existing, comment] }
      })
      setProjectStats(prev => ({
        ...prev,
        [pid]: { ...prev[pid], comments: (prev[pid]?.comments || 0) + 1 }
      }))
    }

    const handleDeleteComment = ({ commentId, projectId }) => {
      const pid = String(projectId)
      setComments(prev => ({
        ...prev,
        [pid]: (prev[pid] || []).filter(c => c._id !== commentId)
      }))
      setProjectStats(prev => ({
        ...prev,
        [pid]: { ...prev[pid], comments: Math.max(0, (prev[pid]?.comments || 1) - 1) }
      }))
    }

    socket.on('new-comment', handleNewComment)
    socket.on('delete-comment', handleDeleteComment)

    return () => {
      socket.off('new-comment', handleNewComment)
      socket.off('delete-comment', handleDeleteComment)
    }
  }, [socket])

  const fetchProjects = async (cursor = null, search = null) => {
    const isInitialLoad = !cursor
    if (isInitialLoad) setLoading(true)
    else setLoadingMore(true)
    setError(null)

    try {
      let url = cursor
        ? `/api/getProjects?cursor=${cursor}&limit=21`
        : `/api/getProjects?limit=21`

      if (search) url += `&search=${encodeURIComponent(search)}`

      const response = await axios.get(url, { withCredentials: true })
      const newProjects = response.data.data
      const pagination = response.data.pagination

      setProjects(prev => cursor ? [...prev, ...newProjects] : newProjects)
      setHasMore(pagination.hasMore)
      setNextCursor(pagination.nextCursor)

      const stats = {}
      const likes = {}
      const commentData = {}
      newProjects.forEach(project => {
        stats[project._id] = { likes: project.likesCount, comments: project.commentsCount }
        likes[project._id] = project.userLiked
        commentData[project._id] = project.comments
      })
      setProjectStats(prev => ({ ...prev, ...stats }))
      setUserLikes(prev => ({ ...prev, ...likes }))
      setComments(prev => ({ ...prev, ...commentData }))
    } catch (err) {
      console.error(err)
      setError('Unable to load projects!')
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsSearching(false)
    }
  }

  const loadMoreProjects = () => {
    if (nextCursor && !loadingMore) fetchProjects(nextCursor, searchTerm || null)
  }

  const handleLike = async (projectId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    const previousLiked = userLikes[projectId]
    const previousCount = projectStats[projectId]?.likes || 0

    setUserLikes(prev => ({ ...prev, [projectId]: !previousLiked }))
    setProjectStats(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], likes: previousLiked ? previousCount - 1 : previousCount + 1 }
    }))

    try {
      if (previousLiked) {
        await axios.delete(`/api/project/unlike/${projectId}`, { withCredentials: true })
      } else {
        await axios.post(`/api/project/like/${projectId}`, {}, { withCredentials: true })
      }
    } catch (err) {
      setUserLikes(prev => ({ ...prev, [projectId]: previousLiked }))
      setProjectStats(prev => ({ ...prev, [projectId]: { ...prev[projectId], likes: previousCount } }))
      toast.error(err.response?.data?.message || "Error processing like")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComment = async (projectId) => {
    const text = commentText[projectId]
    if (!text || !text.trim()) {
      toast.error("Please enter a comment")
      return
    }

    const newComment = {
      _id: Date.now().toString(),
      projectId,
      userEmail: user.email,
      userName: user.name,
      text,
      createdAt: new Date().toISOString()
    }

    setComments(prev => ({ ...prev, [projectId]: [...(prev[projectId] || []), newComment] }))
    setProjectStats(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], comments: (prev[projectId]?.comments || 0) + 1 }
    }))
    setCommentText(prev => ({ ...prev, [projectId]: '' }))

    try {
      const response = await axios.post(`/api/project/comment/${projectId}`, { text }, { withCredentials: true })
      setComments(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(c => c._id === newComment._id ? response.data.comment : c)
      }))
    } catch (err) {
      setComments(prev => ({ ...prev, [projectId]: prev[projectId].filter(c => c._id !== newComment._id) }))
      setProjectStats(prev => ({
        ...prev,
        [projectId]: { ...prev[projectId], comments: (prev[projectId]?.comments || 1) - 1 }
      }))
      setCommentText(prev => ({ ...prev, [projectId]: text }))
      toast.error(err.response?.data?.message || "Error adding comment")
    }
  }

  const handleDeleteComment = async (commentId, projectId, commentText) => {
    const confirmed = await new Promise(resolve => {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-slate-500">Delete comment?</p>
          {commentText && (
            <p className="text-xs text-slate-500 italic line-clamp-2">
              "{commentText.length > 60 ? commentText.slice(0, 60) + '…' : commentText}"
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true) }}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
            >Yes, Delete</button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false) }}
              className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300"
            >Cancel</button>
          </div>
        </div>
      ), { duration: 8000 })
    })
    if (!confirmed) return

    const previousComments = comments[projectId] || []
    const previousCount = projectStats[projectId]?.comments || 0

    setComments(prev => ({ ...prev, [projectId]: prev[projectId].filter(c => c._id !== commentId) }))
    setProjectStats(prev => ({
      ...prev,
      [projectId]: { ...prev[projectId], comments: Math.max(0, previousCount - 1) }
    }))

    try {
      await axios.delete(`/api/project/comment/${commentId}`, { withCredentials: true })
      toast.success("Comment deleted")
    } catch (err) {
      setComments(prev => ({ ...prev, [projectId]: previousComments }))
      setProjectStats(prev => ({ ...prev, [projectId]: { ...prev[projectId], comments: previousCount } }))
      toast.error(err.response?.data?.message || "Error deleting comment")
    }
  }

  const handleCollabRequest = async (projectId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await axios.post(`/api/project/collaborate/${projectId}`, { message: collabMessage }, { withCredentials: true })
      setShowCollabModal(null)
      setCollabMessage('')
      toast.success("Collaboration request sent successfully!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCommentPage = (project) => {
    setSelectedCommentProject(project)
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Discover Projects
            </h2>
            <p className="text-slate-400 text-sm mt-1">Explore and collaborate on amazing student projects</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <BiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, tech, category..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-xl transition-all duration-300 placeholder-slate-500"
            />
            {isSearching && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
            {searchTerm && !isSearching && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700 transition-all"
              >
                <HiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active search indicator */}
        {searchTerm && !isSearching && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-slate-400 text-sm">
              Showing results for <span className="text-violet-400 font-semibold">"{searchTerm}"</span>
            </span>
            <button onClick={clearSearch} className="text-xs text-slate-500 hover:text-slate-300 underline">Clear</button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 text-lg font-medium">Loading projects...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 font-semibold text-xl text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-4xl">
            🔍
          </div>
          <p className="text-slate-300 text-xl font-semibold text-center">
            {searchTerm ? `No projects found for "${searchTerm}"` : 'No projects yet'}
          </p>
          <p className="text-slate-500 text-sm text-center max-w-xs">
            {searchTerm ? 'Try a different search term' : 'Be the first to share your project with the community!'}
          </p>
          {!searchTerm && (
            <Link to='/upload' className='mt-2 inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-lg'>
              Upload First Project
            </Link>
          )}
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && projects.length > 0 && (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-violet-500/10 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <span className="text-white/80 text-xs">
                      {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="bg-white/15 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
                    {Array.isArray(project.category) ? project.category[0] : project.category}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h2 className="text-lg font-bold text-white mb-3 truncate">{project.title}</h2>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {project.name?.charAt(0).toUpperCase() || project.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm min-w-0">
                      <p className="text-slate-200 font-semibold truncate">
                        {project.name || project.email.split('@')[0].slice(0, -2)}...
                      </p>
                      <p className="text-slate-400 text-xs truncate">{project.college}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                <div className="mb-4">
                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
                      Tech Stack
                    </p>

                    {/* Main Container */}
                    <motion.div
                      className="relative flex items-center gap-1.5 overflow-hidden group cursor-default"
                      initial="initial"
                      whileHover="hover"
                    >
                      {/* Sliding Wrapper */}
                      <motion.div
                        className="flex gap-1.5 transition-all duration-750 ease-linear"
                        variants={{
                          initial: { x: 0 },
                          hover: { x: project.techStack.length > 4 ? '-36%' : 0 } // Adjust percentage as needed
                        }}
                      >
                        {project.techStack.map((tech, i) => (
                          <span
                            key={i}
                            className="whitespace-nowrap bg-violet-500/10 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-lg border border-violet-500/20"
                          >
                            {tech}
                          </span>
                        ))}
                      </motion.div>

                      {/* Counter Badge (Visible only when not hovering) */}
                      {project.techStack.length > 4 && (
                        <motion.span
                          variants={{
                            initial: { opacity: 1, x: 0 },
                            hover: { opacity: 0, x: 20 }
                          }}
                          className="absolute right-0 bg-slate-900/80 pl-2 text-slate-500 text-xs font-semibold px-2 py-1"
                        >
                          +{project.techStack.length - 4} more
                        </motion.span>
                      )}
                    </motion.div>
                  </div>

                  <hr className="border-slate-700 mb-3" />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleLike(project._id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-violet-500/10 transition-colors group"
                    >
                      {userLikes[project._id] ? (
                        <BiSolidLike className="w-5 h-5 text-violet-400 group-hover:scale-125 transition-transform" />
                      ) : (
                        <BiLike className="w-5 h-5 text-slate-400 group-hover:text-violet-400 group-hover:scale-125 transition-all" />
                      )}
                      <span className={`text-sm font-semibold ${userLikes[project._id] ? 'text-violet-400' : 'text-slate-400'}`}>
                        {projectStats[project._id]?.likes || 0}
                      </span>
                    </button>

                    <button
                      onClick={() => openCommentPage(project)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-500/10 transition-colors group"
                    >
                      <MdOutlineInsertComment className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:scale-125 transition-all" />
                      <span className="text-sm font-semibold text-slate-400 group-hover:text-emerald-400">
                        {projectStats[project._id]?.comments || 0}
                      </span>
                    </button>
                  </div>


                  <button
                    onClick={() => setShowCollabModal(project._id)}
                    className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all cursor-pointer shadow-md hover:shadow-violet-500/25 active:scale-95"
                  >
                    🤝 Request Collaboration
                  </button>
                </div>

                <CollabModel
                  showCollabModal={showCollabModal}
                  projectId={project._id}
                  projectTitle={project.title}
                  collabMessage={collabMessage}
                  setCollabMessage={setCollabMessage}
                  handleCollabRequest={handleCollabRequest}
                  setShowCollabModal={setShowCollabModal}
                  isSubmitting={isSubmitting}
                />
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMoreProjects}
                disabled={loadingMore}
                className="px-8 py-3 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 hover:border-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : 'Load More Projects'}
              </button>
            </div>
          )}

          {!hasMore && projects.length > 0 && (
            <div className="text-center mt-10">
              <p className="text-slate-500 text-sm">✨ You've seen all projects</p>
            </div>
          )}
        </>
      )}
      {/* Comment Page Modal */}
      {selectedCommentProject && (
        <CommentPage
          project={selectedCommentProject}
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          handleComment={handleComment}
          handleDeleteComment={handleDeleteComment}
          onClose={() => setSelectedCommentProject(null)}
          user={user}
        />
      )}
    </div>
  )
}

export default ProjectGrid
