import React, { useState, useEffect } from "react";
import axios from 'axios'
import { MdOutlineInsertComment } from "react-icons/md";
import { BiLike, BiSolidLike } from "react-icons/bi";
import Welcome from "./Welcome";
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


  useEffect(() => {
    if (!loggedIn) {
      setProjects([])
      return
    }
    fetchProjects()
  }, [loggedIn])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/getProjects', { withCredentials: true })
      setProjects(response.data)

      response.data.forEach(project => {
        fetchProjectStats(project._id)
      })
    } catch (err) {
      console.error("Error fetching projects:", err)
    }
  }

  const fetchProjectStats = async (projectId) => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        axios.get(`/api/project/likes/${projectId}`, { withCredentials: true }),
        axios.get(`/api/project/comments/${projectId}`, { withCredentials: true })
      ])

      setProjectStats(prev => ({
        ...prev,
        [projectId]: {
          likes: likesRes.data.count,
          comments: commentsRes.data.count
        }
      }))

      const userEmail = localStorage.getItem('userEmail')
      const userLiked = likesRes.data.likes.some(like => like.userEmail === userEmail)
      setUserLikes(prev => ({ ...prev, [projectId]: userLiked }))
      setComments(prev => ({ ...prev, [projectId]: commentsRes.data.comments }))
    } catch (err) {
      console.error("Error fetching project stats:", err)
    }
  }

  const handleLike = async (projectId) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (userLikes[projectId]) {
        await axios.delete(`/api/project/unlike/${projectId}`, { withCredentials: true })
      } else {
        await axios.post(`/api/project/like/${projectId}`, {}, { withCredentials: true })
      }
      fetchProjectStats(projectId)
    } catch (err) {
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

    try {
      await axios.post(
        `/api/project/comment/${projectId}`,
        { text },
        { withCredentials: true }
      )
      setCommentText(prev => ({ ...prev, [projectId]: '' }))
      fetchProjectStats(projectId)
      alert("Comment added successfully!")
    } catch (err) {
      alert(err.response?.data?.message || "Error adding comment")
    }
  }

  const handleDeleteComment = async (commentId, projectId) => {
    if (!window.confirm("Delete this comment?")) return

    try {
      await axios.delete(`/api/project/comment/${commentId}`, { withCredentials: true })
      fetchProjectStats(projectId)
      alert("Comment deleted")
    } catch (err) {
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

  if (projects.length === 0) {
    return <Welcome />
  }

  return (
    <div className="min-h-screen p-6 pt-18 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500">
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-6 drop-shadow-lg">
        Discover Projects
      </h2>

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
              <p className="text-gray-700 text-sm h-18 leading-relaxed line-clamp-3 mb-4">
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
    </div>
  )
}

export default ProjectGrid
