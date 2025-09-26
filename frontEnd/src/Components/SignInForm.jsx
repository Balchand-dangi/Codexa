
import axios from 'axios'
import React, { useState } from 'react'
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom'
function SignInForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting,setIsSubmitting] = useState(false)
    const navigate = useNavigate()


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(isSubmitting) return;
        setIsSubmitting(true);

        const userData = { email, password }

        try {
            const response = await axios.post('/api/auth/signIn', userData)
            if (response.data === "Login successfully, Welcome back") {
                alert(response.data)
                setEmail("")
                setPassword("")
                navigate("/")
                
            }
            else{
                alert(response.data.message)
            }
        }
        catch (err) {
            console.log(err.message)
            if (err.response && err.response.data) {
                alert(err.response.data.message || err.response.data)
            } else {
                alert("something went wrong")
            }
        }
        finally{
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className='flex justify-center items-center min-h-screen bg-gray-200'>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-90">
                    <h2 className='text-2xl font-bold mb-10 text-center'>Sign in</h2>

                    <input
                        type="email"
                        placeholder='Enter your email'
                        autoComplete='username'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                    />

                    <div className='relative '>
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete='current-password'
                            placeholder='Enter your password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                        />
                        <span className='absolute right-3 top-3.5 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    <button
                        type='Submit' disabled={isSubmitting} className="w-full bg-blue-500 text-white cursor-pointer py-2 rounded-md hover:bg-blue-600 mb-4 mt-5 transition">
                        Sign in
                    </button>
                </form>

            </div>
        </>
    )
}

export default SignInForm
