import React from 'react'
import { useNavigate } from 'react-router-dom'

function CollabModel({
    showCollabModal,
    projectId,
    collabMessage,
    setCollabMessage,
    handleCollabRequest,
    setShowCollabModal,
    isSubmitting
}) {
    const navigate = useNavigate()

    // Only render if modal should be shown for this project
    if (showCollabModal !== projectId) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Collaboration Request</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Send a collaboration request to project owner.
                </p>
                <textarea
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Add a message (optional)"
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    maxLength="500"
                />
                <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                        onClick={() => navigate('/teamStatus', { state: { projectId } })}
                        className="flex-1 px-2 py-2 bg-green-400 text-black cursor-pointer rounded-lg hover:bg-green-500 font-medium transition"
                    >
                        Team Status
                    </button>
                    <button
                        disabled={isSubmitting}
                        onClick={() => handleCollabRequest(projectId)}
                        className="flex-1 px-4 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 font-semibold transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                    </button>
                    <button
                        onClick={() => {
                            setShowCollabModal(null)
                            setCollabMessage('')
                        }}
                        className="flex-1 px-4 py-2 bg-red-500 cursor-pointer text-white rounded-lg hover:bg-red-600 font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CollabModel
