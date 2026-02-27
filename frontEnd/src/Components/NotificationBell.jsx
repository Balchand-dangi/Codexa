import React, { useEffect, useRef, useState } from 'react';
import { MdNotifications } from 'react-icons/md';
import axios from 'axios';

const NotificationBell = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', { withCredentials: true });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handleOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 30));
      setUnreadCount(prev => prev + 1);
    };
    socket.on('new-notification', handleNewNotification);
    return () => socket.off('new-notification', handleNewNotification);
  }, [socket]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read', {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, { withCredentials: true });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const acceptCollaborationRequest = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/accept`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => (n._id === notificationId ? { ...n, status: 'accepted', isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const rejectCollaborationRequest = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/reject`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => (n._id === notificationId ? { ...n, status: 'rejected', isRead: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'collaboration_request': return '🤝';
      case 'stage_submission': return '📨';
      case 'stage_submission_result': return '📋';
      default: return '📢';
    }
  };

  const formatTime = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const renderNotificationText = (notification) => {
    if (notification.type === 'stage_submission' || notification.type === 'stage_submission_result') {
      return notification.message;
    }
    return (
      <>
        <span className="font-semibold text-white">{notification.senderName}</span>{' '}
        {notification.type === 'like' && 'liked your project'}
        {notification.type === 'comment' && 'commented on your project'}
        {notification.type === 'collaboration_request' && 'sent a collaboration request for'}{' '}
        <span className="text-violet-400 font-medium">"{notification.projectTitle}"</span>
      </>
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => { const next = !showDropdown; setShowDropdown(next); if (next) fetchNotifications(); }} className="relative p-2 rounded-xl hover:bg-slate-700/60 transition">
        <MdNotifications className="w-6 h-6 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-violet-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed top-[60px] right-2 sm:right-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-[9999] overflow-hidden w-[calc(100vw-16px)] sm:w-96 max-h-[75vh] flex flex-col">
          <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center z-30 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && <span className="bg-violet-500/20 text-violet-400 text-xs font-semibold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs text-violet-400 hover:text-violet-300 font-medium transition px-2 py-1 rounded-lg hover:bg-violet-500/10">Mark all read</button>}
              <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-white text-xl px-2 transition" aria-label="Close notifications">×</button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">🔔</div>
                <p className="text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
             
              notifications.map((notification) => (
                <div key={notification._id} title={notification.isRead  ? undefined : 'Click to mark as read'} className={`p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition  ${!notification.isRead ? 'bg-violet-500/5 border-l-2 border-l-violet-500' : ''}`} onClick={() => !notification.isRead && markAsRead(notification._id)}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-snug">{renderNotificationText(notification)}</p>

                      {notification.type === 'collaboration_request' && (
                        <p className="text-xs text-slate-500 mt-1 break-all">
                          Contact:{' '}
                          <a href={`mailto:${notification.sender}`} className="text-violet-400 hover:underline ml-1" onClick={(e) => e.stopPropagation()}>
                            {notification.sender}
                          </a>
                        </p>
                      )}

                      {notification.commentText && <p className="text-xs text-slate-500 mt-1 italic break-words">"{notification.commentText}"</p>}

                      {notification.type === 'collaboration_request' && notification.status === 'pending' && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <button onClick={(e) => { e.stopPropagation(); acceptCollaborationRequest(notification._id); }} className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold transition">Accept</button>
                          <button onClick={(e) => { e.stopPropagation(); rejectCollaborationRequest(notification._id); }} className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-semibold transition">Reject</button>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2.5 gap-2">
                        <span className="text-xs text-slate-500">{formatTime(notification.createdAt)}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }} title="Delete notification" className="text-xs text-red-400 cursor-pointer hover:text-red-500 transition font-medium">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
