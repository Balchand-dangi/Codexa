import React from 'react'

function About() {
    return (
        <>
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 px-6 md:px-20 lg:px-32">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        About Us
                    </h1>

                    <p className="text-base md:text-lg leading-relaxed text-blue-50">
                        Codexa-web is a platform designed to bring developers, students,
                        and tech enthusiasts together. Here, they can showcase their innovative projects,
                        explore ideas from others, and collaborate to turn concepts into reality.
                        Our goal is to create a community where learning, sharing, and growth happen seamlessly,
                        making it easier for aspiring developers to connect and thrive.
                    </p>
                </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </>
    )
}

export default About
