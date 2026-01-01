import React, { useState, useEffect } from "react";
import axios from 'axios'
import { MdOutlineInsertComment } from "react-icons/md";
import { BiLike, BiSolidLike } from "react-icons/bi";
import Welcome from "./Welcome";

const ProjectGrid = ({ loggedIn }) => {
  const [projects, setProjects] = useState([])
  const [projectStats, setProjectStats] = useState({})
  const [userLikes, setUserLikes] = useState({})
  const [showComments, setShowComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [comments, setComments] = useState({})
  const [showCollabModal, setShowCollabModal] = useState(null)
  const [collabMessage, setCollabMessage] = useState('')


  

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

      // Fetch stats for each project
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

      // Check if user liked this project
      const userEmail = localStorage.getItem('userEmail') // You'll need to store this on login
      const userLiked = likesRes.data.likes.some(like => like.userEmail === userEmail)
      setUserLikes(prev => ({ ...prev, [projectId]: userLiked }))

      setComments(prev => ({ ...prev, [projectId]: commentsRes.data.comments }))
    } catch (err) {
      console.error("Error fetching project stats:", err)
    }
  }

  const handleLike = async (projectId) => {
    try {
      if (userLikes[projectId]) {
        await axios.delete(`/api/project/unlike/${projectId}`, { withCredentials: true })
      } else {
        await axios.post(`/api/project/like/${projectId}`, {}, { withCredentials: true })
      }
      fetchProjectStats(projectId)
    } catch (err) {
      alert(err.response?.data?.message || "Error processing like")
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
    }
  }

  const toggleComments = (projectId) => {
    setShowComments(prev => ({ ...prev, [projectId]: !prev[projectId] }))
  }

  if (projects.length === 0) {
    return (
      <Welcome/>
    )
  }

  return (
    <div className="p-6 mt-14 
   bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500
">
      <h2 className="text-2xl flex justify-center font-bold text-black mb-5">Projects</h2>

      <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mx-3 break-words">
        {projects.map((project, index) => (
          <div key={project._id} className="bg-gray-50 shadow-md rounded-xl px-3 pb-5 pt-1.5 hover:shadow-lg transition">
            <div className="flex">
              <p className="ml-auto leading-none text-sm text-gray-700">{new Date(project.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}</p>
            </div>
            <p className="text-2xl leading-none font-semibold text-blue-700">
              {index + 1}. {project.title}
            </p>
            <h2 className="text-lg pt-0.5 font-semibold text-blue-800">by - {project.email}</h2>
            <h2 className="text-lg  font-semibold text-blue-800">from - {project.college}</h2>
            <p className="text-gray-950 text-md mt-2">{project.description}</p>
            <p className="text-gray-950 text-md mt-2">Tech Stack: {project.techStack.join(', ')}</p>

            <div className="flex justify-between items-center mt-3">
              <h3 className="font-medium text-sm">{project.category}</h3>

              <div className="flex gap-3">
                <button
                  onClick={() => handleLike(project._id)}
                  className="flex items-center gap-1 hover:scale-110 transition"
                >
                  {userLikes[project._id] ? (
                    <BiSolidLike className="w-6 h-6 text-blue-600" />
                  ) : (
                    <BiLike className="w-6 h-6" />
                  )}
                  <span className="text-sm">{projectStats[project._id]?.likes || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(project._id)}
                  className="flex items-center gap-1 hover:scale-110 transition"
                >
                  <MdOutlineInsertComment className="w-6 h-6" />
                  <span className="text-sm">{projectStats[project._id]?.comments || 0}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {showComments[project._id] && (
              <div className="mt-4 border-t pt-3">
                <div className="mb-3">
                  <textarea
                    value={commentText[project._id] || ''}
                    onChange={(e) => setCommentText(prev => ({
                      ...prev,
                      [project._id]: e.target.value
                    }))}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded text-sm resize-none"
                    rows="2"
                    maxLength="500"
                  />
                  <button
                    onClick={() => handleComment(project._id)}
                    className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Comment
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments[project._id]?.map(comment => (
                    <div key={comment._id} className="bg-white p-2 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-xs text-gray-700">{comment.userName}</p>
                        <button
                          onClick={() => handleDeleteComment(comment._id, project._id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-gray-800 mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center mt-3">
              <button
                onClick={() => setShowCollabModal(project._id)}
                className="bg-blue-600 rounded-2xl px-6 py-1.5 text-white hover:bg-blue-700 cursor-pointer transition"
              >
                Send Collab Request
              </button>


            </div>

            {/* Collaboration Modal */}
            {showCollabModal === project._id && (
              <div className="fixed inset-0    bg-gray-400
 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-200 rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Collaboration Request</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a collaboration request to the project owner
                  </p>
                  <textarea
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Add a message (optional)"
                    className="w-full p-2 border rounded mb-4 resize-none"
                    rows="4"
                    maxLength="500"
                  />
                  <div className="flex gap-3 justify-end">

                    <button onClick={() => alert("This will be available soon, project owner will contact you via Email.")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      check status
                    </button>

                    <button
                      onClick={() => handleCollabRequest(project._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Send Request
                    </button>
                    <button
                      onClick={() => {
                        setShowCollabModal(null)
                        setCollabMessage('')
                      }}
                      className="px-4 py-2 border bg-red-500 rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectGrid