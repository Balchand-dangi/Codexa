import React, { useState, useEffect } from "react";

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
import useFCM from './hooks/useFCM';
import NotificationToast from './Components/NotificationToast';


function App() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );
  const { notification, removeToken, getTokenAndSave, isReady } = useFCM();
  const [toastNotification, setToastNotification] = useState(null);


  useEffect(() => {

    if (!loggedIn && isReady) {
      removeToken();
    } else if (loggedIn && isReady) {
      console.log('🎯 [App.jsx] Login detected - Calling getTokenAndSave');
      getTokenAndSave();
    }
  }, [loggedIn, isReady, removeToken, getTokenAndSave]);

  useEffect(() => {
    if (notification) {
      setToastNotification(notification);
    }
  }, [notification]);

  return (
    <>
      <NotificationToast
        notification={toastNotification}
        onClose={() => setToastNotification(null)}
      />

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
        <Route path="/MyProfile" element={<MyProfile />} />



      </Routes>
    </>
  );
}

export default App;
