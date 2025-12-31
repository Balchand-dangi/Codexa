import React from 'react'

import { useNavigate } from "react-router-dom";


function Welcome() {
  const navigate = useNavigate()
  return (
    <>
        <div className="grid place-items-center bg-white py-20">
          <div className="text-center p-6 rounded-2xl m-5 shadow-lg bg-gray-200">
            <h1 className="bg-blue-800 text-5xl text-amber-400 font-bold px-6 py-4 rounded-lg">
              Welcome to Developers World
            </h1>
            <button onClick={() => navigate("/SignUpForm")}>
              <h3 className="bg-red-600 cursor-pointer mt-6 text-lg text-white font-medium px-4 py-2 rounded-md">
                Please register yourself to see all the projects
              </h3>
            </button>
          </div>

          <p >𝑩𝒖𝒊𝒍𝒕 𝒃𝒚 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓, 𝒇𝒐𝒓 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔.</p>
        </div>


      </>
  )
}

export default Welcome

