import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

/**
 * useSocket — manages a single Socket.IO connection lifecycle
 * - Connects when user is logged in
 * - Joins the user's personal room for notifications
 * - Disconnects on logout / unmount
 * Returns the socket instance (or null if not connected)
 */
const useSocket = (user) => {
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user?.email) {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            return
        }

        // Create connection — connects to same origin as the page
        const socket = io(window.location.origin, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            // Join personal notification room
            socket.emit('join-user', user.email)
        })

        socket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message)
        })

        socketRef.current = socket

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [user?.email])

    return socketRef.current
}

export default useSocket
