

const FeaturesDoc = () => {
  return (
    <div className="min-h-screen mt-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 py-8 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Codexa Web Features
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl leading-relaxed">
            Your all-in-one platform for developer collaboration. Built with MERN stack for seamless teamwork.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-16 space-y-20">
        {/* Core Features */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-12">
            Core Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-700/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-2xl font-bold text-violet-400 mb-4">Project Management</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• Create & manage projects with pagination & filtering</li>
                <li>• Track progress through stages (Team Formation, PPTs, etc.)</li>
                <li>• Admin status button for quick updates</li>
              </ul>
            </div>
            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-700/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Real-time Collaboration</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• Live comments & notifications</li>
                <li>• Team formation & teammate search</li>
                <li>• Modern animations (fade-in, slide, zoom)</li>
              </ul>
            </div>
            <div className="group bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-700/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Admin Panel</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• Manage users & projects</li>
                <li>• Delete/edit capabilities</li>
                <li>• Status tracking dashboard</li>
                <li>• Globle state module</li>
                
              </ul>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-12">
            Authentication & Security
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">Secure User Flows</h3>
              <div className="space-y-4">
                <p>• Email verification & password reset</p>
                <p>• JWT-based auth & role management</p>
                <p>• Rate limiting & session handling</p>
              </div>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 md:text-lg">
              <p className="text-slate-300 mb-6">Production-ready security ensures safe collaboration for all users.</p>
              <div className="bg-slate-700/50 p-6 rounded-2xl">
                <code className="text-blue-400 text-sm">Protected routes • Admin middleware • Input validation</code>
              </div>
            </div>
          </div>
        </section>

        {/* How to Use */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-12">
            How to Use
          </h2>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
              <div className="md:w-1/3">
                <h3 className="text-2xl font-bold text-violet-400 mb-4">1. Get Started</h3>
                <p className="text-slate-300">Sign up and verify your email to join the developer community.</p>
              </div>
              <div className="md:w-2/3 grid md:grid-cols-2 gap-4 text-sm">
                <div>• Dashboard → Create Project</div>
                <div>• Add teammates & set stages</div>
                <div>• Collaborate in real-time</div>
                <div>• Track progress visually</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-slate-700/50">
              <div className="text-center p-6 rounded-2xl bg-slate-700/30 hover:bg-slate-600/50 transition-all">
                <div className="text-3xl mb-2">🚀</div>
                <h4 className="font-bold text-blue-400">Quick Share</h4>
                <p className="text-sm text-slate-400 mt-2">Share projects instantly with one click.</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-slate-700/30 hover:bg-slate-600/50 transition-all">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-bold text-violet-400">Live Comments</h4>
                <p className="text-sm text-slate-400 mt-2">Discuss & get feedback in real-time.</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-slate-700/30 hover:bg-slate-600/50 transition-all">
                <div className="text-3xl mb-2">📊</div>
                <h4 className="font-bold text-purple-400">Progress Tracking</h4>
                <p className="text-sm text-slate-400 mt-2">Visual stages & completion percentage.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="pt-12 border-t border-slate-700/50">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-200 to-slate-100 bg-clip-text text-transparent mb-8">
            Tech Stack
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {['MERN Stack', 'Tailwind CSS', 'MongoDB Atlas', 'Socket.io (RT)', 'React Router'].map((tech, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center hover:bg-slate-700/60 transition-all group">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{getIcon(i)}</div>
                <p className="font-semibold text-slate-200">{tech}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-6 md:px-12 lg:px-24 bg-slate-900/50 backdrop-blur-md mt-20">
        <p className="text-center text-slate-400 text-lg">
          Built with ❤️ for developers | <span className="text-violet-400 font-bold">Codexa Web</span>
        </p>
      </footer>
    </div>
  );
};

// Helper for icons (replace with actual icons or react-icons)
const getIcon = (i) => {
  const icons = ['⚛️', '💨', '🗄️', '🔌', '📍'];
  return icons[i % icons.length];
};

export default FeaturesDoc;
