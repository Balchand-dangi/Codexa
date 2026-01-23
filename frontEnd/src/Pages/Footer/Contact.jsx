import React from 'react'

function Contact() {
    return (
        <div>
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 px-6 md:px-20 lg:px-32">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent text-center">
                        Get in Touch
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Owner Card */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-blue-200 text-sm font-medium mb-2">Platform Owner</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">👤</span>
                                <div>
                                    <h3 className="font-semibold text-lg">Balchand Dangi</h3>
                                    <p className="text-sm text-blue-100 mt-1">Founder & Developer</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-blue-200 text-sm font-medium mb-2">Email Us</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📧</span>
                                <div>
                                    <a 
                                        href="mailto:dangibalchand935@gmail.com" 
                                        className="font-medium hover:text-blue-300 transition-colors underline break-all"
                                    >
                                        dangibalchand935@gmail.com
                                    </a>
                                    <p className="text-sm text-blue-100 mt-1">We'll respond within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="text-blue-200 text-sm font-medium mb-2">Call Us</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <a 
                                        href="tel:+916232579495" 
                                        className="font-semibold text-lg hover:text-blue-300 transition-colors"
                                    >
                                        +91 6232579495
                                    </a>
                                    <p className="text-sm text-blue-100 mt-1">Sat - Sun, 9 AM - 8 PM </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        </div>
    )
}

export default Contact
