import axios from 'axios'
import React, { useEffect } from 'react'

function UserProfile() {
  const [myProfile, setMyProfile] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/getMyProfile', { withCredentials: true })
        setMyProfile(res.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err.message || "Failed to load your profile")
      } finally {
        setLoading(false)
      }
    }

    fetchMyProfile()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 min-h-screen">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 font-medium text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 min-h-screen">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 font-semibold text-2xl text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // No profile state
  if (!myProfile) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 min-h-screen">
        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-8 sm:p-12">
          <p className="text-slate-400 font-medium text-lg">No profile found</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen'>
      {/* Profile Card */}
      <div className='bg-slate-800/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-2xl w-full mt-16'>

        {/* Profile Header */}
        <div className='flex flex-col sm:flex-row items-center gap-6 mb-8'>
          {/* Avatar */}
          <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-violet-500/20'>
            {myProfile.name?.charAt(0).toUpperCase()}
          </div>

          {/* Name and Email */}
          <div className='text-center sm:text-left'>
            <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>
              {myProfile.name}
            </h1>
            <p className='text-slate-400 text-sm flex items-center gap-2 justify-center sm:justify-start'>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {myProfile.email}
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>

          {/* Skills Card */}
          {myProfile.skills && (
            <div className='bg-slate-700/40 backdrop-blur-lg rounded-xl p-4 sm:p-5 border border-slate-600/50 hover:bg-slate-700/60 transition-all'>
              <div className='flex items-center gap-2 mb-3'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className='font-semibold text-white text-base sm:text-lg'>Skills</h3>
              </div>
              <p className='text-slate-300 text-sm sm:text-base break-words'>{myProfile.skills}</p>
            </div>
          )}

          {/* Age Card */}
          {myProfile.age && (
            <div className='bg-white/8 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/40 hover:bg-white/12 transition-all'>
              <div className='flex items-center gap-2 mb-3'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className='font-semibold text-white text-base sm:text-lg'>Age</h3>
              </div>
              <p className='text-white/90 text-sm sm:text-base'>{myProfile.age} years</p>
            </div>
          )}

          {/* College Card */}
          {myProfile.college && (
            <div className='bg-white/8 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/40 hover:bg-white/12 transition-all sm:col-span-2'>
              <div className='flex items-center gap-2 mb-3'>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <h3 className='font-semibold text-white text-base sm:text-lg'>College</h3>
              </div>
              <p className='text-slate-300 text-sm sm:text-base break-words'>{myProfile.college}</p>
            </div>
          )}

          {/* Joined Date Card */}
          <div className='bg-white/8 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/40 hover:bg-white/12 transition-all sm:col-span-2'>
            <div className='flex items-center gap-2 mb-3'>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className='font-semibold text-white text-base sm:text-lg'>Member Since</h3>
            </div>
            <p className='text-white/90 text-sm sm:text-base'>{new Date(myProfile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
