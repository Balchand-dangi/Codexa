import React from 'react'

function About() {
    return (
        <>
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 px-6 md:px-20 lg:px-32">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        About Codexa-Web
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed text-blue-50 mb-6">
                        Codexa-web is a developer collaboration platform that brings together developers, students,
                        and tech enthusiasts in one connected space. Powered by Firebase Cloud Messaging, we deliver
                        instant real-time notifications so you never miss important project updates, collaborations,
                        or community activities.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                            <h3 className="font-semibold text-lg mb-2">🔔 Real-Time Notifications</h3>
                            <p className="text-sm text-blue-100">Stay instantly updated with Firebase-powered notifications for project activity and collaboration requests</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                            <h3 className="font-semibold text-lg mb-2">🚀 Showcase & Explore</h3>
                            <p className="text-sm text-blue-100">Share your innovative projects and discover inspiring work from developers worldwide</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                            <h3 className="font-semibold text-lg mb-2">🤝 Seamless Collaboration</h3>
                            <p className="text-sm text-blue-100">Connect with like-minded developers and get notified instantly when someone wants to collaborate</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
                            <h3 className="font-semibold text-lg mb-2">📈 Stay Connected</h3>
                            <p className="text-sm text-blue-100">Never miss community updates, project comments, or learning opportunities with instant alerts</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </>
    )
}

export default About
