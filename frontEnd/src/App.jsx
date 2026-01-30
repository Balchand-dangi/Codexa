
import axios from "axios";
import { useEffect, useState } from "react";

import SignupForm from "./Pages/SignUpForm";
import SignInForm from "./Pages/SignInForm";
import Home from "./Pages/Home";
import Upload from "./Pages/Upload";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./Components/ScrollTop";
import VerifyEmail from "./Pages/VerifyEmail";
import ComingSoon from "./Pages/ComingSoon";
import MyProjects from "./Pages/MyProjects";
import TeamStatus from "./Pages/TeamStatus";
import MyProfile from "./Pages/MyProfile";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);


  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("/api/auth/verify", { withCredentials: true });

        if (res.data.authenticated) {
          setLoggedIn(true);
          setUser(res.data.user);
          //console.log("Verified user:", res.data.user);
        }

      } catch (err) {
        setLoggedIn(false);
        setUser(null);

      } finally {
        setCheckingAuth(false);
      }
    };

    verifyUser();
  }, []);


  if (checkingAuth) {
    return <div>Loading...</div>;
  }

  return (
    <>

      <ScrollToTop />

      <Routes>

        <Route
          path="/Home"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} user={user} />
          }
        />

        <Route
          path="/"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} user={user} />
          }
        />

        <Route
          path="/about"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} user={user} />
          }
        />

        <Route
          path="/support"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} user={user} />
          }
        />

        <Route
          path="/signUpForm"
          element={<SignupForm setLoggedIn={setLoggedIn} />}

        />
        <Route
          path="/signInForm"
          element={<SignInForm setLoggedIn={setLoggedIn} />}
        />

        <Route
          path="/teamStatus"
          element={loggedIn ? <TeamStatus /> : <SignInForm setLoggedIn={setLoggedIn} />}
        />


        <Route
          path="/upload"
          element={loggedIn ? <Upload /> : <SignInForm setLoggedIn={setLoggedIn} />}
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
