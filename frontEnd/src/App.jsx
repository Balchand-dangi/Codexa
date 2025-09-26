import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import Home from './Pages/Home'
import Upload from './Pages/Upload'
import { Route, Routes } from "react-router-dom";

function App() {
 
  return (
    <>
  
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signUp' element={<SignUp />} />
        <Route path='/logOut' element={<Home />} />
        <Route path='/about' element={<Home />} />
        <Route path='/contact' element={<Home />} />
        <Route path='/signIn' element={<SignIn />} />
        <Route path='/upload' element={<Upload />} />
      </Routes>

    </>
  )
}

export default App
