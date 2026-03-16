import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * useSocket — manages a single Socket.IO connection lifecycle
 * - Connects when user is logged in
 * - Joins the user's personal room for notifications
 * - Disconnects on logout / unmount
 * Returns the socket instance (or null if not connected)
 *
 * Uses useState (not just useRef) so that React re-renders when the socket
 * is ready, ensuring all child components receive the live instance.
 */
const useSocket = (user) => {
    const [socket, setSocket] = useState(null)
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user?.email) {
            // Disconnect if user logs out
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
                setSocket(null)
            }
            return
        }

        // Avoid duplicate connections
        if (socketRef.current?.connected) {
            return
        }

        // Create connection — connects to same origin as the page
        const newSocket = io(window.location.origin, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        })

        // Join personal notification room — do this on every 'connect'
        // so the room membership is restored after auto-reconnect too
        const rejoinUser = () => {
            newSocket.emit('join-user', user.email)
        }
        newSocket.on('connect', rejoinUser)

        newSocket.on('connect_error', (err) => {
            console.warn('[Socket] Connection error:', err.message)
        })

        socketRef.current = newSocket
        setSocket(newSocket)  // ← triggers re-render so children get the live socket

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [user?.email])

    return socket
}

export default useSocket
