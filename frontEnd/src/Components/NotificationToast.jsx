import { useEffect, useState } from 'react';

export default function NotificationToast({ notification, onClose }) {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) return null;

    return (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slideIn">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{notification.body}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-lg flex-shrink-0"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
