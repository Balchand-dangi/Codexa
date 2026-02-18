// socket.js — Socket.IO handler
// Manages room-based connections for project comments and user notifications

let io = null

/**
 * Initialize Socket.IO with the HTTP server
 * Called once from server.js
 */
const initSocket = (socketIO) => {
    io = socketIO

    io.on('connection', (socket) => {
        // ── Project rooms (for real-time comments) ──────────────────────────
        socket.on('join-project', (projectId) => {
            if (projectId) {
                socket.join(`project:${projectId}`)
            }
        })

        socket.on('leave-project', (projectId) => {
            if (projectId) {
                socket.leave(`project:${projectId}`)
            }
        })

        // ── User room (for real-time notifications) ──────────────────────────
        // Client sends their email after auth so we can push notifications to them
        socket.on('join-user', (userEmail) => {
            if (userEmail) {
                socket.join(`user:${userEmail}`)
            }
        })

        socket.on('disconnect', () => {
            // Socket.IO auto-removes from all rooms on disconnect
        })
    })
}

/**
 * Get the io instance — used by controllers to emit events
 * Returns null if socket hasn't been initialized yet (safe to check)
 */
const getIO = () => io

module.exports = { initSocket, getIO }
