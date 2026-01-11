import React, { useState, useEffect } from 'react'
import { MdNotifications } from 'react-icons/md'
import axios from 'axios'

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/notifications', { withCredentials: true })
            setNotifications(response.data.notifications)
            setUnreadCount(response.data.unreadCount)
        } catch (err) {
            console.error('Error fetching notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`/api/notifications/${notificationId}/read`, {}, { withCredentials: true })
            fetchNotifications()
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await axios.patch('/api/notifications/mark-all-read', {}, { withCredentials: true })
            fetchNotifications()
        } catch (err) {
            console.error('Error marking all as read:', err)
        }
    }

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/api/notifications/${notificationId}`, { withCredentials: true })
            fetchNotifications()
        } catch (err) {
            console.error('Error deleting notification:', err)
        }
    }

    const acceptCollaborationRequest = async (notificationId) => {
        try {
            await axios.patch(`/api/notifications/${notificationId}/accept`, {}, { withCredentials: true })
            fetchNotifications()
        } catch (err) {
            console.error('Error accepting request:', err)
        }
    }

    const rejectCollaborationRequest = async (notificationId) => {
        try {
            await axios.patch(`/api/notifications/${notificationId}/reject`, {}, { withCredentials: true })
            fetchNotifications()
        } catch (err) {
            console.error('Error rejecting request:', err)
        }
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return '👍'
            case 'comment': return '💬'
            case 'collaboration_request': return '🤝'
            default: return '📢'
        }
    }

    const formatTime = (timestamp) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diff = Math.floor((now - time) / 1000) // difference in seconds

        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
        return time.toLocaleDateString()
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-full hover:bg-white/20 transition"
            >
                <MdNotifications className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border z-20 max-h-96 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No notifications yet
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 border-b hover:bg-gray-50 transition ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800">
                                                    <span className="font-semibold">
                                                        {notification.senderName}
                                                    </span>
                                                    {' '}
                                                    {notification.type === 'like' && 'liked your project'}
                                                    {notification.type === 'comment' && 'commented on your project'}
                                                    {notification.type === 'collaboration_request' && 'sent a collaboration request for'}
                                                    {' '}
                                                    <span className="font-medium">
                                                        "{notification.projectTitle}"
                                                    </span>
                                                </p>
                                                {notification.type === 'collaboration_request' && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Contact:
                                                        <a
                                                            href={`mailto:${notification.sender}`}
                                                            className="text-blue-600 hover:underline ml-1"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {notification.sender}
                                                        </a>
                                                    </p>
                                                )}

                                                {notification.commentText && (
                                                    <p className="text-xs text-gray-600 mt-1 italic">
                                                        "{notification.commentText}"
                                                    </p>
                                                )}

                                                {notification.type === 'collaboration_request' && notification.status === 'pending' && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                acceptCollaborationRequest(notification._id)
                                                            }}
                                                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                rejectCollaborationRequest(notification._id)
                                                            }}
                                                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}

                                                {notification.type === 'collaboration_request' && notification.status !== 'pending' && (
                                                    <div className="mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${notification.status === 'accepted'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {notification.status?.charAt(0).toUpperCase() + notification.status?.slice(1)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(notification.createdAt)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            deleteNotification(notification._id)
                                                        }}
                                                        className="text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default NotificationBell