import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

function Upload({ user }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [techStack, setTechStack] = useState('')
  const [category, setCategory] = useState("")
  const [college, setCollege] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Frontend validation
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (title.length < 5 || title.length > 50) {
      toast.error("Title must be between 5-50 characters");
      return;
    }

    if (!description.trim()) {
      toast.error("Project description is required");
      return;
    }
    if (description.length < 20 || description.length > 300) {
      toast.error("Description must be between 20-300 characters");
      return;
    }

    const techStackArray = techStack.split(',').map(item => item.trim()).filter(Boolean);
    if (techStackArray.length === 0) {
      toast.error("Tech stack must contain at least one skill");
      return;
    }

    if (!college.trim()) {
      toast.error("College/University name is required");
      return;
    }

    const categoryArray = category.split(',').map(item => item.trim()).filter(Boolean);
    if (categoryArray.length === 0) {
      toast.error("Category must contain at least one value");
      return;
    }

    setIsSubmitting(true);
    const projectData = { title, description, techStack: techStackArray, category: categoryArray, college };

    try {
      const response = await axios.post('/api/uploadProject', projectData, { withCredentials: true })
      if (response.data.message === "Project successfully uploaded") {
        toast.success(response.data.message)
        setTitle(''); setDescription(''); setCollege(''); setCategory(''); setTechStack('');
        navigate("/Home", { state: { refresh: true } })
      } else {
        toast.error(response.data.message || "Upload failed")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass = "w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"

  return (
    <div className='w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-5 mt-10'>
      <div className="w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <div className="relative mb-6">
            {/* Back button - Top Left  */}
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 top-0 p-2 -translate-y-2 hover:text-violet-400 text-slate-400 transition-colors text-sm font-medium flex items-center gap-1 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Centered content */}
            <div className="text-center pt-12">
              <span className="w-12 h-12 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
                📤
              </span>
              <h2 className='text-2xl font-bold text-white'>Share Your Project</h2>
              <p className="text-slate-400 text-sm mt-1">Let the community discover your work</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Your registered email"
              value={user?.email || ''}
              readOnly
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              title="Email is taken from your logged-in account"
            />
            <input
              type="text"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              minLength="5"
              maxLength="50"
              required
            />
            <textarea
              placeholder="Project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none h-auto`}
              minLength="20"
              maxLength="300"
              required
            />
            <input
              type="text"
              placeholder="Tech stack (comma separated, e.g. React, Node.js)"
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="text"
              placeholder="College / University name"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="text"
              placeholder="Category (e.g. AIML, Full Stack, Cybersecurity)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              required
            />

            <button
              type='submit'
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold cursor-pointer py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Upload Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Upload
