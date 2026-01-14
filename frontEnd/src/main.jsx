import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './Components/ScrollTop'

createRoot(document.getElementById('root')).render(
   
    <BrowserRouter>
      <ScrollToTop topWhenHome={0} topWhenAbout={1000} topWhenContact={1000} />
      <App />
    </BrowserRouter>
 
)
