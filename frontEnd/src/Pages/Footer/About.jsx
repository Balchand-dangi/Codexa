import React from 'react'

function About() {
    return (
        <>
            <div className="h-px bg-slate-700/50" />
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-6 md:px-20 lg:px-32 border-t border-slate-800">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            About Codexa
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                            Connecting developers, students, and innovators to build, collaborate, and grow together.
                        </p>
                    </div>

                    {/* Mission */}
                    <section className="mb-20">
                        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Our Mission</h2>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <p className="text-lg leading-relaxed text-slate-300 mb-6">
                                    Codexa is more than just a platform—it's a community built for <strong>developers, students, and tech enthusiasts</strong>. 
                                    We solve the biggest challenges in collaborative development: finding the right teammates, showcasing real projects, 
                                    and turning ideas into working code.
                                </p>
                                <p className="text-lg leading-relaxed text-slate-300">
                                    From hackathons to portfolio projects, Codexa makes it seamless to <strong>discover, collaborate, and ship</strong> amazing work.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 backdrop-blur p-6 rounded-2xl border  hover:border-violet-500/50  border-slate-700/50">
                                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                        <span className="text-2xl">🚀</span>
                                    </div>
                                    <h3 className="font-bold text-white mb-2">Ship Faster</h3>
                                    <p className="text-slate-400 text-sm">Real-time collaboration & project management</p>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur p-6 rounded-2xl border  hover:border-violet-500/50 border-slate-700/50">
                                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
                                        <span className="text-2xl">🤝</span>
                                    </div>
                                    <h3 className="font-bold text-white  mb-2">Team Up</h3>
                                    <p className="text-slate-400 text-sm">Find perfect collaborators for any project</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="mb-20">
                        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white text-center">What Makes Codexa Special</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: '📱',
                                    title: 'Project Discovery',
                                    desc: 'Browse real student projects by tech stack, category, and skill level. No more generic portfolios.'
                                },
                                {
                                    icon: '⚡',
                                    title: 'Real-time Collab',
                                    desc: 'Live notifications, comments, and collaboration requests. Built with Socket.IO for instant updates.'
                                },
                                {
                                    icon: '🔒',
                                    title: 'Student Focused',
                                    desc: 'Designed specifically for college projects, hackathons, and portfolio building. No corporate fluff.'
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group hover:bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50 transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/50">
                                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                                        <span>{feature.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats / CTA */}
                    <section className="text-center py-16 bg-slate-800/30 rounded-3xl backdrop-blur border border-slate-700/50">
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                    3+
                                </div>
                                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Projects Live</p>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                    15+
                                </div>
                                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Students Connected</p>
                            </div>
                            <div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                                    24/7
                                </div>
                                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Real-time Collab</p>
                            </div>
                        </div>
                       
                    </section>

                    {/* Final Words */}
                    <section className="mt-20 pt-16 border-t border-slate-700/50">
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Ready to Build Something Amazing?</h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                                Join thousands of students turning ideas into reality. Whether you're looking for teammates, 
                                inspiration, or a place to showcase your work—Codexa has you covered.
                            </p>
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a href="/upload" className="px-8 py-4 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-all shadow-lg">
                                    Create Project
                                </a>
                                <a href="/" className="px-8 py-4 border-2 border-slate-600 text-slate-300 font-bold rounded-xl hover:bg-slate-700 hover:border-violet-500 transition-all">
                                    Browse Projects
                                </a>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            <div className="h-px bg-slate-700/50" />
        </>
    )
}

export default About
