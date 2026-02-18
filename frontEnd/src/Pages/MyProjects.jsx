import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pagination states
  // Offset-based pagination - Shows 10 projects per page
  // Page numbers with ellipsis (1, 2, ..., 10)
  //  Previous/Next buttons
  //  Shows total count and current page info

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchMyProjects(currentPage)
  }, [currentPage])

  const fetchMyProjects = async (page) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`/api/my-projects?page=${page}&limit=10`, {
        withCredentials: true
      })
      setProjects(res.data.data)
      setTotalPages(res.data.pagination.totalPages)
      setTotalCount(res.data.pagination.totalCount)
    } catch (err) {
      setError('Unable to load your projects')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start justify-center p-6 pt-24'>
      <div className='bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 w-full max-w-3xl shadow-xl'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-white'>
            Your Projects {totalCount > 0 && <span className="text-slate-400 text-lg font-normal">({totalCount})</span>}
          </h1>
          <Link to='/upload' className='px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition'>+ Upload New</Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className='text-slate-400'>Loading your projects...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-semibold text-xl text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-slate-400 mb-4 text-lg'>You don't have any projects yet.</p>
            <Link to='/upload' className='inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition'>
              Upload your first project
            </Link>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <ul className='space-y-3 mb-6'>
              {projects.map((proj, index) => (
                <li key={proj._id} className='bg-slate-700/40 border border-slate-700 rounded-xl p-4 hover:bg-slate-700/60 transition flex items-center justify-between gap-4'>
                  <div className="flex-1 min-w-0">
                    <p className='font-semibold text-white truncate'>
                      <span className="text-violet-400 mr-2">#{(currentPage - 1) * 10 + index + 1}</span>
                      {proj.title}
                    </p>
                    <p className='text-xs text-slate-400 pt-1 truncate'>{proj.techStack?.slice(0, 8).join(', ')}</p>
                  </div>
                  <div className='text-sm text-slate-500 flex-shrink-0'>
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2 flex-wrap'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm'
                >
                  ← Prev
                </button>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`e-${index}`} className='px-3 py-2 text-slate-500'>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${currentPage === page ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm'
                >
                  Next →
                </button>
              </div>
            )}

            <div className='text-center mt-4 text-slate-500 text-sm'>
              Page {currentPage} of {totalPages} · {totalCount} total projects
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyProjects
