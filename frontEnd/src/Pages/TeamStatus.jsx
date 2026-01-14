import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'

function TeamStatus() {
  const location = useLocation()
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

        const groupedRequests = {
          pending: [],
          accepted: [],
          rejected: []
        }

        if (response.data.requests && Array.isArray(response.data.requests)) {
          response.data.requests.forEach(request => {
            const status = request.status || 'pending'

            if (projectId && !projectName && request.projectId?.title) {
              setProjectName(request.projectId.title)
            }
            
            if (groupedRequests[status]) {
              groupedRequests[status].push({
                ...request,
                status
              })
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

  const RequestCard = ({ request, status }) => (
    <div className='bg-white rounded-lg p-2 shadow-sm border-l-3' style={{
      borderLeftColor: status === 'accepted' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b'
    }}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='font-semibold text-indigo-700'>{request.projectId?.title || 'Project'}</p>
          <p className='text-sm text-black mt-1'>From: <span className='font-medium'>{request.requesterName}</span></p>
          <p className='text-sm text-black'>Email: {request.requesterEmail}</p>
          <p className='text-xs text-gray-700 mt-2'>
            {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>

        {status !== 'pending' && (
          <span className={`text-sm px-4 py-2 rounded whitespace-nowrap ml-4 font-medium ${status === 'accepted'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}

        {status == 'pending' && (
          <span className={`text-sm px-4 py-2 rounded whitespace-nowrap ml-4 font-medium ${status === 'pending'
            && 'bg-yellow-300 text-yellow-800'
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 p-4'>
      <div className='max-w-5xl mx-auto'>
        <div className='flex items-center justify-between my-5'>
          <h1 className='text-3xl font-bold text-white'>
            {projectName || (projectId ? 'Project Team Status' : 'All Team Requests')}
          </h1>
          <div className='w-20'></div>
        </div>

        {loading && (
          <div className='bg-white rounded-lg p-8 text-center'>
            <p className='text-gray-600'>Loading team requests...</p>
          </div>
        )}

        {!loading && error && (
          <div className='bg-white rounded-lg p-8 text-center'>
            <p className='text-red-600'>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className='space-y-1'>
            {/* Accepted Requests */}
            <div className='bg-white rounded-lg px-5 pt-2 pb-3 shadow-lg'>
              <div className='flex items-center mb-2'>
                <div className='w-4 h-4 rounded-full bg-green-500 mr-3'></div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Accepted Requests ({collaborationRequests.accepted.length})
                </h2>
              </div>
              {collaborationRequests.accepted.length === 0 ? (
                <p className='text-gray-500 text-center py-4'>No accepted requests</p>
              ) : (
                <div className='space-y-3'>
                  {collaborationRequests.accepted.map(request => (
                    <RequestCard key={request._id} request={request} status='accepted' />
                  ))}
                </div>
              )}
            </div>

            {/* Rejected Requests */}
            <div className='bg-white rounded-lg px-5 pt-2 pb-3 shadow-lg'>
              <div className='flex items-center mb-4'>
                <div className='w-4 h-4 rounded-full bg-red-500 mr-3'></div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Rejected Requests ({collaborationRequests.rejected.length})
                </h2>
              </div>
              {collaborationRequests.rejected.length === 0 ? (
                <p className='text-gray-500 text-center py-4'>No rejected requests</p>
              ) : (
                <div className='space-y-3'>
                  {collaborationRequests.rejected.map(request => (
                    <RequestCard key={request._id} request={request} status='rejected' />
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests */}
            <div className='bg-white rounded-lg px-5 pt-2 pb-3 shadow-lg'>
              <div className='flex items-center mb-4'>
                <div className='w-4 h-4 rounded-full bg-amber-500 mr-3'></div>
                <h2 className='text-xl font-bold text-gray-800'>
                  Pending Requests ({collaborationRequests.pending.length})
                </h2>
              </div>
              {collaborationRequests.pending.length === 0 ? (
                <p className='text-gray-500 text-center py-4'>No pending requests</p>
              ) : (
                <div className='space-y-3'>
                  {collaborationRequests.pending.map(request => (
                    <RequestCard key={request._id} request={request} status='pending' />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamStatus
