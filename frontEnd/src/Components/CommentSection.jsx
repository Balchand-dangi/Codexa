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
  // Only render if comments are visible for this project
  if (!showComments[projectId]) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="mb-4">
        <textarea
          value={commentText[projectId] || ''}
          onChange={(e) => setCommentText(prev => ({
            ...prev,
            [projectId]: e.target.value
          }))}
          placeholder="Write a comment..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows="3"
          maxLength="500"
        />
        <button
          onClick={() => handleComment(projectId)}
          className="mt-2 bg-indigo-600 cursor-pointer text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Post Comment
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {comments[projectId]?.map(comment => (
          <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-sm text-gray-800">{comment.userName}</p>
              <button
                onClick={() => handleDeleteComment(comment._id, projectId)}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-700 text-sm">{comment.text}</p>
            <p className="text-xs text-gray-600 mt-2">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommentSection
