import React from 'react';
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 pt-24 pb-10">
      <div className="max-w-4xl w-full">

        {/* Main Card */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-3xl p-8 md:p-14 shadow-2xl border border-slate-700/50">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              ✨ Open to all developers
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Codexa
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light max-w-xl mx-auto">
              Discover, share, and collaborate on amazing projects with developers worldwide.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button
              onClick={() => navigate("/signUpForm")}
              className="px-8 py-3.5 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-700 hover:shadow-violet-500/25 transition-all active:scale-95"
            >
              Get Started — It's Free
            </button>
            <button
              onClick={() => navigate("/signInForm")}
              className="px-8 py-3.5 bg-slate-700 cursor-pointer text-slate-200 font-semibold rounded-xl border border-slate-600 hover:bg-slate-600 transition-all active:scale-95"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🚀', title: 'Launch Projects', desc: 'Showcase your work to the developer community' },
              { icon: '🤝', title: 'Collaborate', desc: 'Connect and team up with fellow developers' },
              { icon: '💡', title: 'Get Inspired', desc: 'Explore innovative ideas and solutions' },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-slate-700/40 border border-slate-700 p-6 rounded-2xl text-center hover:bg-slate-700/60 hover:border-violet-500/30 transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{icon}</div>
                <h3 className="text-white font-semibold mb-1.5">{title}</h3>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm italic">
            Built by Developers, for Developers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
