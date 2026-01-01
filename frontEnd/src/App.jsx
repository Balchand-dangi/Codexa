import React, { useState } from "react";

import SignupForm from "./Pages/SignUpForm";
import SignInForm from "./Pages/SignInForm";
import Home from "./Pages/Home";
import Upload from "./Pages/Upload";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./Components/ScrollTop";
import VerifyEmail from "./Components/VerifyEmail";
import ComingSoon from "./Components/ComingSoon";

function App() {
  const [loggedIn, setLoggedIn] = useState(
  localStorage.getItem("isLoggedIn") === "true"
);


  return (
    <>

      <ScrollToTop 
        topWhenHome={0}
        topWhenAbout={700} 
        topWhenContact={1400}
      />

      <Routes>
    
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
          path="/contact"
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
          path="/upload"
          element={loggedIn ? <Upload /> : <SignInForm setLoggedIn={setLoggedIn} />}
        />
       <Route path="/verify-email/:token" element={<VerifyEmail />} />
       <Route path="/ComingSoon" element={<ComingSoon/>}/>

        
      </Routes>
    </>
  );
}

export default App;
