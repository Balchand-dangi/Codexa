
import axios from "axios";
import { useEffect, useState } from "react";

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



function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();
  //console.log("App component rendered. LoggedIn:");
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("/api/auth/verify", { withCredentials: true });
        //console.log("Auth verification response:", res.data);

        if (res.data.authenticated) {
          setUser(res.data.user);
          //console.log("Verified user:", res.data.user);
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
    return navigate("/Home")

  }

  //console.log("Rendering Routes. LoggedIn:");

  return (
    <>

      <ScrollToTop />

      <Routes>

        <Route
          path="/Home"
          element={
            <Home user={user} setUser={setUser} />
          }
        />

        <Route
          path="/"
          element={
            <Home user={user} setUser={setUser} />
          }
        />

        <Route
          path="/about"
          element={
            <Home user={user} setUser={setUser} />
          }
        />

        <Route
          path="/support"
          element={
            <Home user={user} setUser={setUser} />
          }
        />

        <Route
          path="/signUpForm"
          element={<SignupForm />}

        />
        <Route
          path="/signInForm"
          element={<SignInForm setUser={setUser} />}
        />

        <Route
          path="/teamStatus"
          element={user ? <TeamStatus /> : <SignInForm setUser={setUser} />}
        />


        <Route
          path="/upload"
          element={user ? <Upload /> : <SignInForm setUser={setUser} />}
        />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/ComingSoon" element={<ComingSoon />} />
        <Route path="/MyProjects" element={<MyProjects />} />
        <Route path="/MyProfile" element={<MyProfile />} />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />



      </Routes>
    </>
  );
}

export default App;
