import axios from 'axios'
import React, { useEffect, useState } from 'react'

function UserProfile() {
  const [myProfile, setMyProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    skills: '',
    age: '',
    college: ''
  })

  //  Fetch profile
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/myProfile/getMyProfile', { withCredentials: true })

        setMyProfile(res.data)

        setFormData({
          name: res.data.name || '',
          skills: res.data.skills || '',
          age: res.data.age || '',
          college: res.data.college || ''
        })

        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchMyProfile()
  }, [])

  //  Lock background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isEditing ? 'hidden' : 'auto'

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isEditing])

  //  Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  //  Update profile
  const handleUpdate = async () => {
    try {
      setUpdating(true)
      const res = await axios.patch('/api/myProfile/updateMyProfile', formData, {
        withCredentials: true
      })
      setMyProfile(res.data)
      setFormData(res.data)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

// Loading state 
if (loading){
  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 justify-center text-slate-400">
      <svg className="p-2 animate-spin h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading profile...
    </div>
  )
}
 
  if (error) {
    return (
      <div className="min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 justify-center text-red-400">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {error}
      </div>
    )
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-slate-400">
        No profile found
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen flex items-center justify-center p-4">

      {/* Profile Card */}
      <div className="relative bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full">

        {/* Edit Button */}
        <button onClick={() => setIsEditing(true)} className="absolute mr-3 cursor-pointer top-4 right-4 sm:top-6 sm:right-6 flex items-center bg-slate-900/80 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-sm sm:text-base text-white transition" > 
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /> 
          </svg> 
          <span className="hidden sm:inline">Edit</span>
         </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {myProfile.name?.charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white">{myProfile.name}</h1>
            <p className="text-slate-400 text-sm">{myProfile.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {myProfile.skills && (
            <InfoCard title="Skills" value={myProfile.skills} />
          )}

          {myProfile.age && (
            <InfoCard title="Age" value={`${myProfile.age} years`} />
          )}

          {myProfile.college && (
            <InfoCard title="College" value={myProfile.college} full />
          )}

          <InfoCard
            title="Member Since"
            value={new Date(myProfile.createdAt).toLocaleDateString()}
            full
          />
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

          <div className="bg-slate-900 w-full max-w-lg rounded-2xl p-6 space-y-4 border border-slate-700">

            <h2 className="text-xl font-bold text-white">Edit Profile</h2>

            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
            <Input name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills" />
            <Input name="age" value={formData.age} onChange={handleChange} placeholder="Age" />
            <Input name="college" value={formData.college} onChange={handleChange} placeholder="College" />

            <div className="flex justify-end gap-3 pt-2">

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-700 cursor-pointer rounded-lg text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 cursor-pointer bg-violet-600 hover:bg-violet-700 rounded-lg text-white"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile

// == SMALL REUSABLE COMPONENTS ==

const InfoCard = ({ title, value, full }) => (
  <div className={`bg-slate-700/40 rounded-xl p-4 border border-slate-600 ${full ? 'sm:col-span-2' : ''}`}>
    <h3 className="text-white font-semibold mb-1">{title}</h3>
    <p className="text-slate-300 text-sm break-words">{value}</p>
  </div>
)

const Input = ({ name, value, onChange, placeholder }) => (
  <input
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-3 rounded-lg  focus:border-violet-500 bg-slate-800 text-white border border-slate-600"
  />
)