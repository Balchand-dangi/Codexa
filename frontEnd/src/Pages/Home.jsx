
import Navbar from '../Components/Navbar'
import ProjectGrid from './ProjectGrid'
import Contact from './Footer/Contact'
import About from './Footer/About'
import Welcome from './Welcome';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';



function Home({user,setUser }) {
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Scroll to section based on route
    if (location.pathname === "/about" && aboutRef.current) {
      setTimeout(() => {
        aboutRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else if (location.pathname === "/support" && contactRef.current) {
      setTimeout(() => {
        contactRef.current.scrollIntoView({ behavior: "smooth" });
      }, 0);
    }
  }, [location.pathname]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      {user ? <ProjectGrid user={user} /> : <Welcome />}
      <div ref={aboutRef}>
        <About />
      </div>
      <div ref={contactRef}>
        <Contact />
      </div>
    </>
  );
}


export default Home
