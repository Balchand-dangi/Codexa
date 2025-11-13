import React, { useState } from "react";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import Home from "./Pages/Home";
import Upload from "./Pages/Upload";
import { Route, Routes } from "react-router-dom";
import ScrollToTop from "./Components/ScrollTop";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

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
          path="/signUp"
          element={<SignUp setLoggedIn={setLoggedIn} />}
        />
        <Route
          path="/signIn"
          element={<SignIn setLoggedIn={setLoggedIn} />}
        />


        <Route
          path="/upload"
          element={loggedIn ? <Upload /> : <SignIn setLoggedIn={setLoggedIn} />}
        />
      </Routes>
    </>
  );
}

export default App;
