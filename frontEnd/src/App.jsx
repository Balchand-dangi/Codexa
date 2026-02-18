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

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
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

  if (checkingAuth) {
    return navigate("/Home");
  }

  return (
    <>
      <Toaster
        position="top-right"
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
      </Routes>
    </>
  );
}

export default App;
