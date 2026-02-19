import React from 'react'

function CommentSection({
  projectId,
  showComments,
  commentText,
  setCommentText,
  handleComment,
  comments,
  handleDeleteComment
}) {
  if (!showComments[projectId]) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      {/* Comment Input */}
      <div className="mb-4">
        <textarea
          value={commentText[projectId] || ''}
          onChange={(e) => setCommentText(prev => ({
            ...prev,
            [projectId]: e.target.value
          }))}
          placeholder="Write a comment..."
          className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
          rows="3"
          maxLength="500"
        />
        <button
          onClick={() => handleComment(projectId)}
          className="mt-2 bg-violet-600 cursor-pointer text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition"
        >
          Post Comment
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments[projectId]?.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-3">No comments yet. Be the first!</p>
        )}
        {comments[projectId]?.map(comment => (
          <div key={comment._id} className="bg-slate-700/40 border border-slate-700 p-3 rounded-xl">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-sm text-violet-400">{comment.userName}</p>
              <button
                onClick={() => handleDeleteComment(comment._id, projectId, comment.text)}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                Delete
              </button>
            </div>
            <p className="text-slate-300 text-sm">{comment.text}</p>
            <p className="text-xs text-slate-500 mt-1.5">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentSection
