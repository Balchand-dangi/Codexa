import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

function MyProjects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pagination states
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

  const handleShowProgress = (projectId) => {
    navigate(`/projectStatus/${projectId}`)
  }

  // Responsive page numbers
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = window.innerWidth < 768 ? 3 : 5 // Mobile: 3 pages, Desktop: 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 1) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i)
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
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center p-4 pt-20 mt-14 sm:pt-24 md:p-6'>
      <div className='w-full max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-6xl'>
        
        {/* Header */}
        <div className='bg-slate-800/60 backdrop-blur-md border mb-5 border-slate-700/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
              <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border-2 border-violet-500/50 rounded-2xl flex items-center justify-center flex-shrink-0'>
                <span className='text-violet-300 font-bold text-lg'>📁</span>
              </div>
              <h1 className='text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent'>
                Your Projects 
                {totalCount > 0 && (
                  <span className='text-slate-400 text-lg sm:text-xl font-normal ml-2'>({totalCount})</span>
                )}
              </h1>
            </div>
              <Link
                to='/'
                className='px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-slate-700  to-slate-800  text-white rounded-2xl text-sm sm:text-base font-bold hover:from-slate-700 hover:to-slate-800 transition-all shadow-lg hover:shadow-slate-500/25 w-full sm:w-auto text-center'
              >
                ← Back to Dashboard
              </Link>
            <Link 
              to='/upload' 
              className='px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-sm sm:text-base font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 w-full sm:w-auto text-center'
            >
              + Upload New
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] gap-4 p-8 mx-auto">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-transparent animate-spin" />
              <div className="absolute inset-2 w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse opacity-75" />
            </div>
            <p className='text-slate-400 text-center text-lg sm:text-xl'>Loading your projects...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 mx-auto max-w-md text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border-2 border-red-500/30">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-300 font-semibold text-lg sm:text-xl">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-sm sm:text-base hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <div className='py-16 px-4 text-center mx-auto max-w-md'>
            <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/50 rounded-3xl flex items-center justify-center">
              <span className='text-4xl text-slate-500'>📂</span>
            </div>
            <h2 className='text-slate-300 text-xl sm:text-2xl font-bold mb-3'>No projects yet</h2>
            <p className='text-slate-500 mb-6 text-sm sm:text-base'>Get started by uploading your first student project</p>
            <Link 
              to='/upload' 
              className='inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold text-base hover:from-violet-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-violet-500/30'
            >
              📤 Upload First Project
            </Link>
          </div>
        )}

        {/* Projects List */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className='space-y-3 mb-8 w-full'>
              {projects.map((proj, index) => (
                <div 
                  key={proj._id} 
                  className='bg-gradient-to-r from-slate-700/40 to-slate-800/40 border border-slate-600/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 hover:from-slate-700/60 hover:to-slate-800/60 hover:border-slate-500/70 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group'
                >
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className="flex-1 min-w-0">
                      <div className='flex items-start sm:items-center gap-3 mb-2 sm:mb-0'>
                        <span className='bg-gradient-to-r from-violet-500 to-purple-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex-shrink-0 shadow-lg'>
                          #{(currentPage - 1) * 10 + index + 1}
                        </span>
                        <h3 className='font-bold text-white text-lg sm:text-xl truncate leading-tight'>
                          {proj.title}
                        </h3>
                      </div>
                      <div className='flex flex-wrap gap-1.5 mt-2'>
                        {proj.techStack?.slice(0, 8).map((tech, i) => (
                          <span 
                            key={i} 
                            className='text-xs bg-slate-600/50 text-slate-300 px-2.5 py-1 rounded-full border border-slate-500/30 backdrop-blur-sm'
                          >
                            {tech}
                          </span>
                        ))}
                        {proj.techStack?.length > 8 && (
                          <span className='text-xs text-slate-500'>+{proj.techStack.length - 9} more</span>
                        )}
                      </div>
                      <p className='text-xs text-slate-500 mt-3 sm:mt-2'>
                        {proj.college || 'Student Project'} • {new Date(proj.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleShowProgress(proj._id)}
                      className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm sm:text-base hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap flex-shrink-0 ml-auto sm:ml-0 mt-3 sm:mt-0"
                      title='Share your project progress'
                    >
                      
                      <span className='hidden sm:inline ml-1'>Share Progress</span>
                      <span className='sm:hidden'>Progress</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Responsive Pagination */}
            {totalPages > 1 && (
              <div className='flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm'>
                {/* Page Info */}
                <div className='text-sm text-slate-400 order-last sm:order-first'>
                  Page {currentPage} of {totalPages} • {totalCount} total projects
                </div>

                {/* Page Numbers */}
                <div className='flex items-center gap-1 flex-wrap justify-center'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='px-3 py-2 min-w-[44px] h-11 bg-slate-700/50 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-600 hover:border-slate-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm shadow-sm hover:shadow-md'
                  >
                    ← Prev
                  </button>

                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span 
                        key={`ellipsis-${index}`} 
                        className='px-3 py-2 text-slate-500 text-sm font-medium'
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 min-w-[44px] h-11 rounded-xl font-bold text-sm shadow-sm transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/25 hover:shadow-violet-500/40'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600 hover:bg-slate-600 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='px-3 py-2 min-w-[44px] h-11 bg-slate-700/50 text-slate-300 border border-slate-600 rounded-xl hover:bg-slate-600 hover:border-slate-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm shadow-sm hover:shadow-md'
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default MyProjects
