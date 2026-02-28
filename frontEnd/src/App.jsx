import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import SignupForm from "./Pages/SignUpForm";
import SignInForm from "./Pages/SignInForm";
import Home from "./Pages/Home";
import Upload from "./Pages/Upload";
import { Route, Routes, useNavigate } from "react-router-dom";
import ScrollToTop from "./Components/ScrollTop";
import VerifyEmail from "./Pages/VerifyEmail";
import ComingSoon from "./Pages/ComingSoon";
import MyProjects from "./Pages/MyProjects";
import TeamStatus from "./Pages/TeamStatus";
import MyProfile from "./Pages/MyProfile";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import AdminPanel from "./Pages/AdminPanel";
import Navbar from "./Components/Navbar";
import useSocket from "./hooks/useSocket";
import ProjectStatus from "./Pages/ProjectStatus";
import FeaturesDoc from "./Components/FeaturesDoc";

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [workflowPrompt, setWorkflowPrompt] = useState(null);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);
  const navigate = useNavigate();

  // Single shared socket connection — alive when user is logged in
  const socket = useSocket(user);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("/api/auth/verify", { withCredentials: true });
        if (res.data.authenticated) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    verifyUser();
  }, []);

  useEffect(() => {
    const loadWorkflowPrompt = async () => {
      if (!user || user.role !== 'user') {
        setWorkflowPrompt(null);
        return;
      }

      try {
        const res = await axios.get('/api/my-projects/stages/workflow', { withCredentials: true });
        const workflow = res.data?.workflow;
        if (workflow?.shouldPrompt) {
          setWorkflowPrompt(workflow);
        } else {
          setWorkflowPrompt(null);
        }
      } catch {
        setWorkflowPrompt(null);
      }
    };

    loadWorkflowPrompt();
  }, [user]);

 
 const formatTimeline = (stage) => {
    if (stage.timelineType === 'duration') {
      return `${stage.durationDays} day${stage.durationDays === 3 ? '' : 's'} from stage start`;
    }
    const start = stage.startDate ? new Date(stage.startDate).toLocaleDateString() : 'N/A';
    const end = stage.endDate ? new Date(stage.endDate).toLocaleDateString() : 'N/A';
    return `${start} -> ${end}`;
  };

  const acceptWorkflow = async () => {
    setWorkflowActionLoading(true);
    try {
      await axios.post('/api/my-projects/stages/workflow/accept', {}, { withCredentials: true });
      setWorkflowPrompt(null);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  const remindWorkflowLater = async () => {
    setWorkflowActionLoading(true);
    try {
      await axios.post('/api/my-projects/stages/workflow/remind-later', {}, { withCredentials: true });
      setWorkflowPrompt(null);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  if (checkingAuth) {
    return null;
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
        }}
      />
      {/* Pass socket to Navbar so NotificationBell can use it */}
      <Navbar user={user} setUser={setUser} socket={socket} />
      <ScrollToTop />

      <Routes>
        <Route path="/Home" element={<Home user={user} setUser={setUser} socket={socket} />} />
        <Route path="/" element={<Home user={user} setUser={setUser} socket={socket} />} />
        <Route path="/about" element={<Home user={user} setUser={setUser} socket={socket} />} />
        <Route path="/support" element={<Home user={user} setUser={setUser} socket={socket} />} />

        <Route path="/signUpForm" element={<SignupForm />} />
        <Route path="/signInForm" element={<SignInForm setUser={setUser} />} />

        <Route path="/teamStatus" element={user ? <TeamStatus /> : <SignInForm setUser={setUser} />} />
        <Route path="/upload" element={user ? <Upload /> : <SignInForm setUser={setUser} />} />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/ComingSoon" element={<ComingSoon />} />
        <Route path="/MyProjects" element={<MyProjects />} />
        <Route path="/MyProfile" element={<MyProfile />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminPanel user={user} />} />
        <Route path="/projectStatus/:projectId" element={user ? <ProjectStatus user={user} /> : <SignInForm setUser={setUser} />} />
        <Route path="/features" element={<FeaturesDoc />} />
      </Routes>

      {workflowPrompt && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Project Workflow Updated</h2>
            <p className="text-slate-400 text-sm mb-5">
              Admin updated global project stages. Accept to activate this workflow.
            </p>

            <div className="space-y-3">
              {(workflowPrompt.stages || []).map((stage, idx) => (
                <div key={stage.stageId} className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-white font-semibold">
                      Stage {idx + 1}: {stage.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {stage.marks} marks
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-2">{stage.description || 'No description provided.'}</p>
                  <p className="text-slate-400 text-xs mt-2">
                    Timeline: <span className="text-slate-200">{formatTimeline(stage)}</span>
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Guidelines: <span className="text-slate-200">{stage.guidelines || 'No additional guidelines.'}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => setWorkflowPrompt(null)}
                disabled={workflowActionLoading}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={remindWorkflowLater}
                disabled={workflowActionLoading}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition disabled:opacity-60"
              >
                Remind Later
              </button>
              <button
                onClick={acceptWorkflow}
                disabled={workflowActionLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {workflowActionLoading ? 'Processing...' : 'Accept Workflow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
