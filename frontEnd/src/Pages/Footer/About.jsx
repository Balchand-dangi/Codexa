import React from 'react'

function About() {
    return (
        <>
        <div className="h-px bg-slate-700/50" />
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-6 md:px-20 lg:px-32 border-t border-slate-800">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                        About Us
                    </h1>
                    <p className="text-base md:text-lg leading-relaxed text-slate-400">
                        Codexa is a platform designed to bring developers, students,
                        and tech enthusiasts together. Here, they can showcase their innovative projects,
                        explore ideas from others, and collaborate to turn concepts into reality.
                        Our goal is to create a community where learning, sharing, and growth happen seamlessly,
                        making it easier for aspiring developers to connect and thrive.
                    </p>
                </div>
            </div>
            <div className="h-px bg-slate-700/50" />
        </>
    )
}

export default About
