
import Navbar from '../Components/Navbar'
import ProjectGrid from './ProjectGrid'
import Contact from './Footer/Contact'
import About from './Footer/About'
import Welcome from './Welcome';



function Home({ loggedIn, setLoggedIn }) {
  return (
    <>
      <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      {loggedIn ? <ProjectGrid loggedIn={loggedIn}/> : <Welcome />}
      <About />
      <Contact />
    </>
  );
}


export default Home
