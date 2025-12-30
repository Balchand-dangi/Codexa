import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";



const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [skills, setSkills] = useState("");
    const [college, setCollege] = useState("");
    const [name, setName] = useState("")
    const [age, setAge] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    { /* for backend */ }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(isSubmitting) return
        setIsSubmitting(true)

        const userData = { name, email, password, age, skills, college }

        try {
            const response = await axios.post("/api/auth/signUp", userData);
            ; // success message
            if( (response.data.message || response.data) === "You'r successfully registered") {
                alert(response.data)
                setName("")
                setEmail("")
                setPassword("")
                setAge("")
                setSkills("")
                setCollege("")
                // console.log("navigating to signIn")
                navigate("/signIn")
            }
            else{
                alert(response.data)
            }

        } catch (error) {
            console.log(error);
            if (error.response && error.response.data) {
                alert(error.response.data.message || error.response.data );
            } else {
                alert("Something went wrong");
            }
        }
        finally{
            setIsSubmitting(false)
        }

    };


    return (
        <div className="flex justify-center items-center min-h-screen  bg-gray-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-md w-90"
            >
                <h2 className="text-2xl font-bold mb-10 text-center">Sign Up</h2>

                <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"


                />
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <div className="relative  ">
                    <input
                        type={showPassword ? "text" : "password"} // toggle type
                        placeholder="Enter strong password & remember"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    { /* Eye Icon */}
                    <span
                        className="absolute right-3 top-3.5 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                </div>

                <input
                    type="number"
                    placeholder="Enter your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"

                />

                <input
                    type="text"
                    placeholder="Enter your skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <input
                    type="text"
                    placeholder="Enter college name"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                
                <span>If already have an account - </span>
                <Link to="/signIn" style={{color:"green", text:"bold", textDecoration:"underline"}}>Sign in</Link>
                

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white mt-5 cursor-pointer py-2 rounded-md hover:bg-blue-600 transition"
                >
                    {isSubmitting ? "Submitting..." : "Sign Up" }
                </button>

            </form>
        </div>
    );
};

export default SignupForm;
