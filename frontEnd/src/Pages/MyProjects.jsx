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
    <div className='min-h-screen bg-gradient-to-r from-blue-700/90 via-indigo-500 to-purple-500 flex items-center justify-center p-6'>
      <div className='bg-black/70 rounded-lg p-6 w-full max-w-3xl shadow-lg'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold text-white'>
            Your Projects {totalCount > 0 && `(${totalCount})`}
          </h1>
          <Link to='/upload' className='text-lg text-blue-700 underline'>Upload new</Link>
        </div>

        {loading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className='text-2xl text-white'>Loading your projects...</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <svg className="w-12 h-12 text-pink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-pink-700 font-semibold text-2xl text-center">{error}</p>
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
            <p className='text-gray-300 mb-3'>You don't have any projects yet.</p>
            <Link to='/upload' className='inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'>
              Upload your first project
            </Link>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <ul className='space-y-3 mb-6'>
              {projects.map((proj, index) => (
                <li key={proj._id} className='bg-black/90 rounded-lg p-4 shadow-sm flex items-center justify-between'>
                  <div>
                    <p className='font-semibold text-white/95'>
                      {(currentPage - 1) * 10 + index + 1}. {proj.title}
                    </p>
                    <p className='text-xs text-white/80 pt-1'>{proj.techStack?.slice(0, 8).join(', ')}</p>
                  </div>
                  <div className='text-sm text-white/80'>
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2 flex-wrap'>
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className='px-3 py-2 text-white'>...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                    >
                      {page}
                    </button>
                  )
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
                >
                  Next →
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className='text-center mt-4 text-white/80 text-sm'>
              Page {currentPage} of {totalPages} • {totalCount} total projects
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyProjects
