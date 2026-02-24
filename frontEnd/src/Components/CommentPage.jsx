import React, { useEffect, useRef } from 'react'
import { MdOutlineInsertComment } from 'react-icons/md'

/**
 * CommentPage — full-screen modal overlay for a single project's comments.
 * Opens instead of expanding the card inline, so the grid never scales.
 */
function CommentPage({
    project,
    comments,
    commentText,
    setCommentText,
    handleComment,
    handleDeleteComment,
    onClose,
    user
}) {
    const textareaRef = useRef(null)
    const commentsEndRef = useRef(null)

    const projectId = project._id
    const projectComments = comments[projectId] || []

    // Lock body scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    // send comment on Enter (without Shift)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleComment(project._id)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [handleComment, project._id])

    // scroll to bottom when new comment is added
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'instant' })
    }, [projectComments.length])



    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MdOutlineInsertComment className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-white font-bold text-base truncate">{project.title}</h2>
                            <p className="text-slate-500 text-xs">
                                {projectComments.length} comment{projectComments.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl leading-none px-2 py-1 hover:bg-slate-700 rounded-lg transition flex-shrink-0"
                        aria-label="Close comments"
                    >
                        ✕
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {projectComments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="text-5xl">💬</div>
                            <p className="text-slate-400 font-medium">No comments yet</p>
                            <p className="text-slate-500 text-sm">Be the first to comment!</p>
                        </div>
                    ) : (
                        projectComments.map(comment => (
                            <div key={comment._id} className="bg-slate-700/40 border border-slate-700 rounded-xl p-3.5">
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {comment.userName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <p className="font-semibold text-sm text-violet-400">{comment.userName}</p>{user?.name === comment.userName ? <span className="text-xs text-slate-400"> (You)</span> : ""}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">
                                            {new Date(comment.createdAt).toLocaleString('en-IN', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                        {(user?.email === comment.userEmail || user?.role === 'admin') && (
                                            <button
                                                onClick={() => handleDeleteComment(comment._id, projectId, comment.text)}
                                                className="text-xs text-red-400 hover:text-red-500 transition font-medium"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed pl-9">{comment.text}</p>
                            </div>
                        ))

                    )}
                    <div ref={commentsEndRef} />
                </div>

                {/* Comment Input */}
                <div className="px-5 py-4 border-t border-slate-700 flex-shrink-0">
                    <textarea
                        ref={textareaRef}
                        value={commentText[projectId] || ''}
                        onChange={(e) => setCommentText(prev => ({ ...prev, [projectId]: e.target.value }))}
                        placeholder="Write a comment..."
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                        rows="3"
                        maxLength="500"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500">
                            {(commentText[projectId] || '').length}/500
                        </span>
                        <button
                            onClick={() => handleComment(projectId)}
                            disabled={!(commentText[projectId] || '').trim()}
                            className="bg-violet-600 cursor-pointer text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommentPage
