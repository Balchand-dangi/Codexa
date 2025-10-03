import React, { useState, useEffect } from "react";
import axios from 'axios'
import { MdOutlineInsertComment } from "react-icons/md";
import { BiLike } from "react-icons/bi";
import { useNavigate } from "react-router";


const ProjectGrid = ({ loggedIn }) => {
  const [project, setProject] = useState([])

  const navigate = useNavigate()


  useEffect(() => {

    if (!loggedIn) {
      setProject([])
      return
    }
    
    axios.get('/api/getProjects',)
      .then((response) => {
        setProject(response.data)
      })
      .catch((err) => {
        console.log("something is wrong",err)
      })
  }, [loggedIn])   //runs when login state changes


  return (
    <>
      {project.length === 0 ? (

        <div className="grid place-items-center  bg-white py-20">
          <div className="text-center p-6 rounded-2xl m-5   shadow-lg bg-gray-200">
            <h1 className="bg-blue-800 text-5xl text-amber-400 font-bold px-6 py-4 rounded-lg">
              Welcome to Developers World
            </h1>
            <button onClick={() => navigate("signUp")}>
              <h3 className="bg-red-600 mt-6 text-lg text-white font-medium px-4 py-2 rounded-md">
                Please register yourself to see all the projects
              </h3>
            </button>
          </div>
        </div>

      ) : (
        <div className="p-6">
          <h2 className="text-2xl flex justify-center font-bold text-gray-800 mb-5 ">Projects</h2>
          {/* Grid layout */}
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3  mx-25">
            {

              project.map((project, index) => (
                <div key={project._id}
                  className="bg-gray-100 shadow-md rounded-xl p-4 hover:shadow-lg transition">
                  <h2 className="text-2xl font-semibold text-blue-700">{index + 1}. {project.title}  </h2>
                  <h2 className="text-lg font-semibold text-blue-800"> by - {project.email} </h2>
                  <h2 className="text-lg font-semibold text-blue-800">from - {project.college}</h2>
                  <p className="text-gray-950 text-md mt-2">{project.description}</p>
                  

                  <div className="flex opacity-70 mt-2 justify-between">
                  <h3 className="font-medium pt-2 mr-25">{project.category}</h3>
                  <span>
                    <button onClick={() => alert("This will be available soon")} >
                      <BiLike className="size-6  mx-2.5 " />
                    </button>

                    <button onClick={() => alert("This will be available soon.")}>
                      <MdOutlineInsertComment className="size-6 mx-2.5 " />
                    </button>
                    </span>
                  </div>
                  <div>

                  </div>

                </div>
              ))
            }
          </div>
        </div>
      )

      }
    </>
  );

};

export default ProjectGrid;

