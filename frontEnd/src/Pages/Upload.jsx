import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Upload() {
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [college, setCollege] = useState("")
  const [isSubmitting , setIsSubmitting] = useState(false)
  const navigate = useNavigate()


  const handleSubmit = async(e) => {
    e.preventDefault();
    if(isSubmitting) return
    setIsSubmitting(true)

    const projectData = { email, title, description  ,category ,college }
    try{
      const response = await axios.post('api/uploadProject',projectData)
      
      if(response.data.message=="Project successfully uploaded"){
        alert(response.data.message)
        setEmail('')
        setTitle('')
        setDescription('')
        setCollege('')
        setCategory('')
        navigate("/")
      }
      
    }
    catch(err){
      console.log(err.message)
      if(err.response && err.response.data){
        alert(err.response.data.message || err.response.data)
      }else{
        alert("Something went wrong")
      }
    }
    finally{
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full flex items-center justify-center min-h-screen  bg-gray-200 '>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-90">
        <h2 className='text-2xl font-bold mb-10 text-center'>Share your project</h2>

        <input
          type="email"
          placeholder="Plz enter your registered email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
        />

        <input
          type="text"
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'

        />

        <input
          type="text"
          placeholder='Description - with required Tech Stack'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
        />

        <input
          type="text"
          placeholder='Enter your college name'
          value={college}
          onChange={(e) => setCollege(e.target.value)}
          className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
        />

        <input
          type="text"
          placeholder='Category of project (ex-AIML/Full Stack/Cyber Security)'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
        />

<span>If don't have an account - </span>
                <Link to="/signUp" style={{color:"green", text:"bold", textDecoration:"underline"}}>Sign up</Link>
                
      
          <button
            type='Submit' disabled={isSubmitting}
            className="w-full mt-5 bg-blue-500 text-white cursor-pointer py-2 rounded-md hover:bg-blue-600  transition"
          > Upload
          </button>
  
      </form>
    </div>
  )
}

export default Upload
