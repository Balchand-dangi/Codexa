

import React from 'react';
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center px-4 pt-27 pb-7">
      <div className="max-w-4xl w-full">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Developers World
              </span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-light">
              Discover, share, and collaborate on amazing projects
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => navigate("/SignUpForm")}
              className="group relative bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold 
                         px-8 py-4 rounded-full shadow-lg hover:shadow-xl 
                         transform hover:scale-105 transition-all duration-300 ease-out"
            >
              <span className="relative z-10">Get Started - Join Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 
                              rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              </div>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-center border border-white/20 
                            hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-white font-semibold mb-2">Launch Projects</h3>
              <p className="text-white/80 text-sm">Showcase your work to the community</p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-center border border-white/20 
                            hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-white font-semibold mb-2">Collaborate</h3>
              <p className="text-white/80 text-sm">Connect with fellow developers</p>
            </div>

            <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-center border border-white/20 
                            hover:bg-white/20 transition-all duration-300">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-white font-semibold mb-2">Get Inspired</h3>
              <p className="text-white/80 text-sm">Explore innovative solutions</p>
            </div>
          </div>

          {/* Already have account */}
          <div className="text-center">
            <p className="text-white/90">
              Already have an account?{' '}
              <button
                onClick={() => navigate("/signInForm")}
                className="text-yellow-300 hover:text-yellow-200 font-semibold underline 
                          transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-white/90 text-lg font-light italic">
            Built by Developers, for Developers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;

