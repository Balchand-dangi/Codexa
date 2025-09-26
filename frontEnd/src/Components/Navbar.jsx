import axios from "axios";
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
const Navbar = ({ setLoggedIn }) => {


  const handleLogOut = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/logOut')
      // console.log(response.data.message)
      setLoggedIn(false)
      alert(response.data.message)

    }
    catch (err) {
      if (err.response.data || err.response) {
        console.log(err)
        alert(err.response.data.err)
      } else {
        alert("Something went wrong")
      }
    }
  }


  return (
    <>
      <nav className="bg-white relative shadow-md w-full py-3 z-1 flex  justify-around items-center fixed">

        <h1 className="text-2xl ml-2 font-bold pl-10 text-blue-600">Developer Colleboration Tool</h1>

        <ul className="hidden md:flex space-x-2 p-3 text-gray-700 font-bold cursor-pointer  ">
          <NavLink className={({ isActive }) =>
            `hover:text-blue-600 ${isActive ? "bg-red-400" : ""} px-3 py-1 rounded`
          } to="/">Home</NavLink>
          <NavLink className={({ isActive }) => { return `hover:text-blue-600 ${isActive ? "bg-red-400" : ""} px-2 py-1 rounded` }
          } to="/about">About</NavLink>
          <NavLink className={({ isActive }) =>
            `hover:text-blue-600 ${isActive ? "bg-red-400" : ""} px-2 py-1 rounded`
          } to="/contact">Contact</NavLink>
        </ul>


        <div className="flex space-x-10 px-10">
          <Link to="/signIn">
            <button
              className="px-4 cursor-pointer py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
              Sign in
            </button>
          </Link>

          <Link to="/signUp">
            <button className="px-4 cursor-pointer py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
              Sign up
            </button>
          </Link>


          <button onClick={handleLogOut} className="px-4 cursor-pointer py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition">
            logOut
          </button>



          <Link to="/upload">
            <button className="px-4 cursor-pointer py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-600 hover:text-white transition"
            >Upload project
            </button>
          </Link>

        </div>

      </nav>
    </>
  );
};

export default Navbar;

