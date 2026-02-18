import React from 'react'
import { useNavigate } from 'react-router-dom'

function CollabModel({
    showCollabModal,
    projectId,
    projectTitle,
    collabMessage,
    setCollabMessage,
    handleCollabRequest,
    setShowCollabModal,
    isSubmitting
}) {
    const navigate = useNavigate()

    if (showCollabModal !== projectId) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg">
                        🤝
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Collaboration Request</h3>
                        {projectTitle && (
                            <p className="text-violet-400 text-sm font-medium truncate max-w-[260px]">{projectTitle}</p>
                        )}
                    </div>
                </div>

                <p className="text-slate-400 text-sm mb-4">
                    Send a collaboration request to the project owner.
                </p>

                <textarea
                    value={collabMessage}
                    onChange={(e) => setCollabMessage(e.target.value)}
                    placeholder="Add a message (optional)..."
                    className="w-full p-3 bg-slate-700/60 border border-slate-600 text-white placeholder-slate-500 rounded-xl mb-4 resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-sm"
                    rows="4"
                    maxLength="500"
                />

                <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                        onClick={() => navigate('/teamStatus', { state: { projectId } })}
                        className="flex-1 px-3 py-2.5 bg-slate-700 text-slate-200 cursor-pointer rounded-xl hover:bg-slate-600 font-medium transition text-sm border border-slate-600"
                    >
                        Team Status
                    </button>
                    <button
                        disabled={isSubmitting}
                        onClick={() => handleCollabRequest(projectId)}
                        className="flex-1 px-4 py-2.5 bg-violet-600 cursor-pointer text-white rounded-xl hover:bg-violet-700 font-semibold transition disabled:opacity-50 text-sm"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Request'}
                    </button>
                    <button
                        onClick={() => {
                            setShowCollabModal(null)
                            setCollabMessage('')
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-700 cursor-pointer text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 font-semibold transition text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CollabModel
