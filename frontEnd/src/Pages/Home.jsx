
import Navbar from '../Components/Navbar'
import ProjectGrid from './ProjectGrid'
import Contact from './Footer/Contact'
import About from './Footer/About'



function Home({ loggedIn, setLoggedIn }) {
  return (
    <>
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <ProjectGrid loggedIn={loggedIn} />
      <About />
      <Contact />
    </>
  );
}


export default Home
