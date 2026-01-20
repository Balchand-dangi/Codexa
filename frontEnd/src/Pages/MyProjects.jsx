import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMyProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get('/api/getProjects', { withCredentials: true })
        const email = localStorage.getItem('userEmail')
        if (!email) {
          setProjects([])
        } else {
          const my = Array.isArray(res.data) ? res.data.filter(p => p.email === email) : []
          setProjects(my)
        }
      } catch (err) {
        console.error(err)
        setError('Unable to load your projects')
      } finally {
        setLoading(false)
      }
    }

    fetchMyProjects()
  }, [])

  return (
    <div className='min-h-screen  bg-gradient-to-r from-blue-700/90 via-indigo-500 to-purple-500 flex items-center justify-center p-6'>
      <div className='bg-black/70 rounded-lg p-6 w-full max-w-3xl shadow-lg'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold text-white'>Your Projects</h1>
          <Link to='/upload' className='text-lg text-blue-700 underline'>Upload new</Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className='text-2xl'>Loading your projects...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <svg className="w-12 h-12 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className=" text-pink-700 font-semibold text-2xl text-center">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 border bg-gray-300 text-indigo-600 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-700 mb-3'>You don't have any projects yet.</p>
            <Link to='/upload' className='inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg'>Upload your first project</Link>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <ul className='space-y-3'>
            {projects.map(proj => (
              <li key={proj._id} className='bg-black/90 rounded-lg p-4 shadow-sm flex items-center justify-between'>
                <div>
                  <p className='font-semibold text-white/95'>{proj.title}</p>
                  <p className='text-xs text-white/80 pt-1'>{proj.techStack?.slice(0, 8).join(', ')}</p>
                </div>
                <div className='text-sm text-white/80'>
                  {new Date(proj.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MyProjects
