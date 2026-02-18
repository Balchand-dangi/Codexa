import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'

function TeamStatus() {
  const location = useLocation()
  const navigate = useNavigate()
  const projectId = location.state?.projectId

  const [collaborationRequests, setCollaborationRequests] = useState({
    pending: [],
    accepted: [],
    rejected: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projectName, setProjectName] = useState('')

  useEffect(() => {
    const fetchCollaborationRequests = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axios.get('/api/project/collaboration-requests', {
          withCredentials: true,
          params: projectId ? { projectId } : {}
        })

        const groupedRequests = { pending: [], accepted: [], rejected: [] }

        if (response.data.requests && Array.isArray(response.data.requests)) {
          response.data.requests.forEach(request => {
            const status = request.status || 'pending'
            if (projectId && !projectName && request.projectId?.title) {
              setProjectName(request.projectId.title)
            }
            if (groupedRequests[status]) {
              groupedRequests[status].push({ ...request, status })
            }
          })
        }

        setCollaborationRequests(groupedRequests)
      } catch (err) {
        console.error('Error fetching collaboration requests:', err)
        setError(err.response?.data?.message || 'Failed to load team status')
      } finally {
        setLoading(false)
      }
    }

    fetchCollaborationRequests()
  }, [projectId])

  const statusConfig = {
    accepted: { label: 'Accepted', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30', border: 'border-l-emerald-500' },
    rejected: { label: 'Rejected', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-400 border border-red-500/30', border: 'border-l-red-500' },
    pending: { label: 'Pending', dot: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/30', border: 'border-l-amber-500' },
  }

  const RequestCard = ({ request, status }) => {
    const cfg = statusConfig[status]
    return (
      <div className={`bg-slate-700/40 border border-slate-700 border-l-4 ${cfg.border} rounded-xl p-4 flex items-start justify-between gap-4`}>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-violet-400 text-sm truncate">{request.projectId?.title || 'Project'}</p>
          <p className="text-sm text-slate-300 mt-1">
            From: <span className="font-medium text-white">{request.requesterName}</span>
          </p>
          <p className="text-sm text-slate-400">{request.requesterEmail}</p>
          <p className="text-xs text-slate-500 mt-2">
            {new Date(request.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>
    )
  }

  const SectionCard = ({ title, status, requests }) => {
    const cfg = statusConfig[status]
    return (
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
          <h2 className="text-lg font-bold text-white">
            {title}
            <span className="ml-2 text-sm font-normal text-slate-400">({requests.length})</span>
          </h2>
        </div>
        {requests.length === 0 ? (
          <p className="text-slate-500 text-center py-6 text-sm">No {status} requests</p>
        ) : (
          <div className="space-y-3">
            {requests.map(request => (
              <RequestCard key={request._id} request={request} status={status} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const displayTitle = projectName || (projectId ? 'Project Team Status' : 'All Team Requests')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pt-20">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Team Status</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{displayTitle}</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition border border-slate-600"
          >
            ← Back
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 flex flex-col items-center gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-400">Loading team requests...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-slate-800/60 border border-red-500/30 rounded-2xl p-8 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-4">
            <SectionCard title="Accepted Requests" status="accepted" requests={collaborationRequests.accepted} />
            <SectionCard title="Pending Requests" status="pending" requests={collaborationRequests.pending} />
            <SectionCard title="Rejected Requests" status="rejected" requests={collaborationRequests.rejected} />
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamStatus
