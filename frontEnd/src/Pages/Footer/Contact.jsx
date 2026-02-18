import React from 'react'

function Contact() {
    return (
        <div>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6 md:px-20 lg:px-32 border-t border-slate-800">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
                        Get in Touch
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Owner Card */}
                        <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:bg-slate-700/60 transition-all">
                            <div className="text-violet-400 text-sm font-medium mb-3">Platform Owner</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">👤</span>
                                <div>
                                    <h3 className="font-semibold text-lg text-white">Balchand Dangi</h3>
                                    <p className="text-sm text-slate-400 mt-1">Founder & Developer</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:bg-slate-700/60 transition-all">
                            <div className="text-violet-400 text-sm font-medium mb-3">Email Us</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📧</span>
                                <div>
                                    <a
                                        href="mailto:dangibalchand935@gmail.com"
                                        className="font-medium text-slate-200 hover:text-violet-400 transition-colors underline break-all text-sm"
                                    >
                                        dangibalchand935@gmail.com
                                    </a>
                                    <p className="text-sm text-slate-400 mt-1">We'll respond within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:bg-slate-700/60 transition-all">
                            <div className="text-violet-400 text-sm font-medium mb-3">Call Us</div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">📱</span>
                                <div>
                                    <a
                                        href="tel:+916232579495"
                                        className="font-semibold text-lg text-white hover:text-violet-400 transition-colors"
                                    >
                                        +91 6232579495
                                    </a>
                                    <p className="text-sm text-slate-400 mt-1">Sat - Sun, 9 AM - 8 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-px bg-slate-700/50 pb-1" />
        </div>
    )
}

export default Contact
