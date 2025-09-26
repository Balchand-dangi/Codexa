import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import ProjectGrid from '../Components/ProjectGrid'
import Contact from './Footer/Contact'
import About from './Footer/About'



function Home() {
  const [loggedIn, setLoggedIn] = useState(true)  // assuming sign in
  return (
    <div>
      
      <Navbar setLoggedIn={setLoggedIn} />
       <ProjectGrid loggedIn={loggedIn} /> 
      <About />
      <Contact />
    </div>
  )
}

export default Home
