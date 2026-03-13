import React, { useEffect, useRef } from 'react'
import { MdOutlineInsertComment } from 'react-icons/md'

function CommentPage({
  project,
  comments,
  commentText,
  setCommentText,
  handleComment,
  handleDeleteComment,
  onBottomStateChange,
  onClose,
  user,
  loading
}) {

  const textareaRef = useRef(null)
  const commentsEndRef = useRef(null)
  const containerRef = useRef(null)
  const isFirstLoad = useRef(true)
  const isAtBottomRef = useRef(true)

  const projectId = project._id
  const projectComments = comments[projectId] || []

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ESC close
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Enter to send
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleComment(projectId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleComment, projectId])

  // Track scroll position
  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return

    const threshold = 80
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold

    onBottomStateChange?.(isAtBottomRef.current)
  }

  useEffect(() => {
    isFirstLoad.current = true
    isAtBottomRef.current = true
    onBottomStateChange?.(true)
  }, [projectId, onBottomStateChange])

  // Smart auto scroll
  useEffect(() => {

    if (!commentsEndRef.current) return

    // Initial open → instant jump
    if (isFirstLoad.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'auto' })
      isFirstLoad.current = false
      return
    }

    // Realtime new comment → smooth only if user already bottom
    if (isAtBottomRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }

  }, [projectComments.length])

  // Mobile keyboard safe scroll
  const handleTextareaFocus = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >

      <div className="bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
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
            className="text-slate-400 hover:text-white/90 text-2xl cursor-pointer px-2 py-1 hover:bg-slate-700 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Comments */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        >

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Loading comments...</p>
            </div>
          ) : projectComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-5xl">💬</div>
              <p className="text-slate-400 font-medium">No comments yet</p>
              <p className="text-slate-500 text-sm">Be the first to comment!</p>
            </div>
          ) : (

            projectComments.map(comment => (
              <div key={comment._id} className="bg-slate-700/40 border border-slate-700 rounded-xl p-3.5">
               
                {/* MOBILE */}
                <div className="grid grid-cols-[auto_1fr_auto] grid-rows-2 gap-x-2 sm:hidden ">

                  <div className="row-span-2 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {comment.userName?.charAt(0).toUpperCase() || '?'}
                  </div>

                  <div className="text-sm font-semibold text-violet-400 truncate">
                    {comment.userName}
                    {user?.name === comment.userName &&
                      <span className="text-xs text-slate-400 ml-1">(You)</span>}
                  </div>

                  <div className="text-right">
                    {(user?.email === comment.userEmail || user?.role === 'admin') && (
                      <button
                        onClick={() =>
                          handleDeleteComment(comment._id, projectId, comment.text, !!comment.pending)
                        }
                        className="text-xs text-red-400 font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  <div className="col-span-2 text-slate-300 text-sm leading-relaxed">
                    {comment.text}
                  </div>

                </div>

                {/* DESKTOP */}
                <div className="hidden sm:block">

                  <div className="flex justify-between items-start mb-1.5">

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {comment.userName?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <p className="font-semibold text-sm text-violet-400">
                        {comment.userName}
                      </p>

                      {user?.name === comment.userName &&
                        <span className="text-xs text-slate-400">(You)</span>}
                    </div>

                    <div className="flex items-center gap-3">

                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {(user?.email === comment.userEmail || user?.role === 'admin') && (
                        <button
                          onClick={() =>
                            handleDeleteComment(comment._id, projectId, comment.text, !!comment.pending)
                          }
                          className="text-xs text-red-400 hover:text-red-500 font-medium"
                        >
                          Delete
                        </button>
                      )}

                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed pl-9">
                    {comment.text}
                  </p>

                </div>

              </div>
            ))

          )}

          <div ref={commentsEndRef} />
   
        </div>

        {/* Input */}  
        <div className="px-5 py-4 border-t border-slate-700">

          <textarea
            ref={textareaRef}
            onFocus={handleTextareaFocus}
            value={commentText[projectId] || ''}
            onChange={(e) =>
              setCommentText(prev => ({ ...prev, [projectId]: e.target.value }))
            }
            placeholder="Write a comment..."
            className="w-full p-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl text-sm resize-none focus:ring-2 focus:ring-violet-500 outline-none"
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
              className="bg-violet-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-40"
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
