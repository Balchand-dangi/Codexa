import React, { useState } from "react";

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

function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );


  return (
    <>

      <ScrollToTop />

      <Routes>

        <Route
          path="/Home"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          }
        />
        
        <Route
          path="/"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          }
        />

        <Route
          path="/about"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          }
        />
        
        <Route
          path="/support"
          element={
            <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
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
          element={<TeamStatus />}
        />

        <Route
          path="/upload"
          element={loggedIn ? <Upload /> : <SignInForm setLoggedIn={setLoggedIn} />}
        />

        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/ComingSoon" element={<ComingSoon />} />
        <Route path="/MyProjects" element={<MyProjects />} />



      </Routes>
    </>
  );
}

export default App;
