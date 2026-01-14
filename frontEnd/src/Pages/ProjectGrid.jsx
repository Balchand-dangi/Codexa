import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { MdOutlineInsertComment } from "react-icons/md";
import { BiLike, BiSolidLike } from "react-icons/bi";
import CollabModel from "../Components/CollabModel";
import CommentSection from "../Components/CommentSection";


const ProjectGrid = ({ loggedIn }) => {
  const [projects, setProjects] = useState([])
  const [projectStats, setProjectStats] = useState({})
  const [userLikes, setUserLikes] = useState({})
  const [showComments, setShowComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [comments, setComments] = useState({})
  const [showCollabModal, setShowCollabModal] = useState(null)
  const [collabMessage, setCollabMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loggedIn) {
      setProjects([])
      return
    }
    fetchProjects()
  }, [loggedIn])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('/api/getProjects', { withCredentials: true })
      setProjects(response.data)

      // Extract stats directly from response
      const stats = {}
      const likes = {}
      const commentData = {}
      
      response.data.forEach(project => {
        stats[project._id] = {
          likes: project.likesCount,
          comments: project.commentsCount
        }
        likes[project._id] = project.userLiked
        commentData[project._id] = project.comments
      })
      
      setProjectStats(stats)
      setUserLikes(likes)
      setComments(commentData)
    } catch (err) {
      console.error(err)
      setError('Unable to load projects!')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (projectId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    
    // Store previous state for rollback
    const previousLiked = userLikes[projectId]
    const previousCount = projectStats[projectId]?.likes || 0
    
    // Optimistic update
    setUserLikes(prev => ({ ...prev, [projectId]: !previousLiked }))
    setProjectStats(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        likes: previousLiked ? previousCount - 1 : previousCount + 1
      }
    }))
    
    try {
      if (previousLiked) {
        await axios.delete(`/api/project/unlike/${projectId}`, { withCredentials: true })
      } else {
        await axios.post(`/api/project/like/${projectId}`, {}, { withCredentials: true })
      }
    } catch (err) {
      // Rollback on error
      setUserLikes(prev => ({ ...prev, [projectId]: previousLiked }))
      setProjectStats(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          likes: previousCount
        }
      }))
      alert(err.response?.data?.message || "Error processing like")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComment = async (projectId) => {
    const text = commentText[projectId]
    if (!text || !text.trim()) {
      alert("Please enter a comment")
      return
    }

    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName') || userEmail.split('@')[0]
    
    // Optimistic update
    const newComment = {
      _id: Date.now().toString(), // Temporary ID
      projectId,
      userEmail,
      userName,
      text,
      createdAt: new Date().toISOString()
    }
    
    setComments(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newComment]
    }))
    
    setProjectStats(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        comments: (prev[projectId]?.comments || 0) + 1
      }
    }))
    
    setCommentText(prev => ({ ...prev, [projectId]: '' }))

    try {
      const response = await axios.post(
        `/api/project/comment/${projectId}`,
        { text },
        { withCredentials: true }
      )
      
      // Replace temporary comment with real one from server
      setComments(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(c => 
          c._id === newComment._id ? response.data.comment : c
        )
      }))
    } catch (err) {
      // Rollback on error
      setComments(prev => ({
        ...prev,
        [projectId]: prev[projectId].filter(c => c._id !== newComment._id)
      }))
      setProjectStats(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          comments: (prev[projectId]?.comments || 1) - 1
        }
      }))
      setCommentText(prev => ({ ...prev, [projectId]: text }))
      alert(err.response?.data?.message || "Error adding comment")
    }
  }

  const handleDeleteComment = async (commentId, projectId) => {
    if (!window.confirm("Delete this comment?")) return

    // Store previous state for rollback
    const previousComments = comments[projectId] || []
    const previousCount = projectStats[projectId]?.comments || 0
    
    // Optimistic update
    setComments(prev => ({
      ...prev,
      [projectId]: prev[projectId].filter(c => c._id !== commentId)
    }))
    
    setProjectStats(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        comments: Math.max(0, previousCount - 1)
      }
    }))

    try {
      await axios.delete(`/api/project/comment/${commentId}`, { withCredentials: true })
      alert("Comment deleted")
    } catch (err) {
      // Rollback on error
      setComments(prev => ({
        ...prev,
        [projectId]: previousComments
      }))
      setProjectStats(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          comments: previousCount
        }
      }))
      alert(err.response?.data?.message || "Error deleting comment")
    }
  }

  const handleCollabRequest = async (projectId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await axios.post(
        `/api/project/collaborate/${projectId}`,
        { message: collabMessage },
        { withCredentials: true }
      )
      setShowCollabModal(null)
      setCollabMessage('')
      alert("Collaboration request sent successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleComments = (projectId) => {
    setShowComments(prev => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  return (
    <div className="min-h-screen p-6 pt-18 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500">
      <h2 className="text-3xl md:text-3xl font-bold text-white text-center mb-6 drop-shadow-lg">
        Discover Projects
      </h2>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-3xl">Loading ...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 py-8">
          <svg className="w-12 h-12 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className=" text-pink-700 font-semibold text-4xl text-center">{error}</p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className='py-8 text-center'>
          <p className='text-gray-700 text-4xl mb-3'>There is no projects yet.</p>
          <Link to='/upload' className='inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg'>Upload the first project</Link>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl  transition-all duration-300"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="bg-white text-indigo-600 font-bold text-sm px-3 py-1 rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-white/90 text-xs">
                    {new Date(project.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <span className="bg-white/20 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">

                <h2 className="text-xl font-bold text-gray-800 mb-3 truncate">
                  {project.title}
                </h2>

                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {project.name?.charAt(0).toUpperCase() || project.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-800 font-semibold">{project.name || project.email.split('@')[0].slice(0, -2)}...</p>
                    <p className="text-gray-700 text-xs">{project.college}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm h-18 leading-relaxed line-clamp-3 mb-2.5">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-semibold mb-2">Tech Stack:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-200"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="text-indigo-600 text-xs font-semibold px-2 py-1">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                </div>
                    <hr className="opacity-15"/>
                {/* Action Buttons */}
                <div className="flex justify-between items-center py-0.5 border-t border-gray-100">
                  <button disabled={isSubmitting}
                    onClick={() => handleLike(project._id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors group"
                  >
                    {userLikes[project._id] ? (
                      <BiSolidLike className="w-5 h-5 text-indigo-600 group-hover:scale-125 transition-transform" />
                    ) : (
                      <BiLike className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 group-hover:scale-125 transition-all" />
                    )}
                    <span className={`text-sm font-semibold ${userLikes[project._id] ? 'text-indigo-600' : 'text-gray-600'}`}>
                      {projectStats[project._id]?.likes || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleComments(project._id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
                  >
                    <MdOutlineInsertComment className="w-5 h-5 text-gray-500 group-hover:text-purple-600 group-hover:scale-125 transition-all" />
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-purple-600">
                      {projectStats[project._id]?.comments || 0}
                    </span>
                  </button>
                </div>

                {/* Comments Section */}
                <CommentSection
                  projectId={project._id}
                  showComments={showComments}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleComment={handleComment}
                  comments={comments}
                  handleDeleteComment={handleDeleteComment}
                />

                {/* Collaborate Button */}
                <button
                  onClick={() => setShowCollabModal(project._id)}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform cursor-pointer shadow-md"
                >
                  Send Collaboration Request
                </button>
              </div>

              {/* Collaboration Modal */}
              <CollabModel
                showCollabModal={showCollabModal}
                projectId={project._id}
                collabMessage={collabMessage}
                setCollabMessage={setCollabMessage}
                handleCollabRequest={handleCollabRequest}
                setShowCollabModal={setShowCollabModal}
                isSubmitting={isSubmitting}
              />

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default ProjectGrid
