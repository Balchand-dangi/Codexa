import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

function Upload() {
  const [email, setEmail] = useState("")
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
    setIsSubmitting(true);

    const techStackArray = techStack.split(',').map(item => item.trim()).filter(Boolean)
    const categoryArray = category.split(',').map(item => item.trim()).filter(Boolean)
    const projectData = { email, title, description, techStack: techStackArray, category: categoryArray, college }

    try {
      const response = await axios.post('api/uploadProject', projectData)
      if (response.data.message === "Project successfully uploaded") {
        toast.success(response.data.message)
        setEmail(''); setTitle(''); setDescription(''); setCollege(''); setCategory(''); setTechStack('');
        navigate("/Home")
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
          <div className="text-center mb-6">
            <div className="w-12 h-12  bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg">
              📤
            </div>
            <h2 className='text-2xl font-bold text-white'>Share Your Project</h2>
            <p className="text-slate-400 text-sm mt-1">Let the community discover your work</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="Your registered email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            <textarea
              placeholder="Project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass + " resize-none, h-auto"}
            />
            <input type="text" placeholder="Tech stack (comma separated, e.g. React, Node.js)" value={techStack} onChange={(e) => setTechStack(e.target.value)} className={inputClass} />
            <input type="text" placeholder="College / University name" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass} />
            <input type="text" placeholder="Category (e.g. AIML, Full Stack, Cybersecurity)" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />

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
