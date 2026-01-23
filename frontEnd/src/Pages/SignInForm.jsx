import axios from 'axios'
import React, { useState } from 'react'
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom'

function SignInForm({ setLoggedIn }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const userData = { email, password }

        try {
            const response = await axios.post('/api/auth/signIn', userData, { withCredentials: true });
            if (response.status === 200) {
                // Save token and user info to localStorage
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem('userEmail', email);
                if (response.data.name) {
                    localStorage.setItem('userName', response.data.name);
                }

                // Small delay to ensure localStorage is updated before state change
                setTimeout(() => {
                    setLoggedIn(true);
                    alert(response.data.message || response.data)
                    setEmail("")
                    setPassword("")
                    navigate("/Home")
                }, 100);
            }
            else {
                alert(response.data.message || response.data)
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
        finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className='flex justify-center items-center min-h-screen bg-gray-400'>
                <form onSubmit={handleSubmit} className="bg-white/80 p-6 rounded-xl shadow-md w-90">
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
                            className='w-full mb-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                        />
                        <span className='absolute right-3 top-3.5 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>


                    <Link to={'/ComingSoon'} className='text-sm pl-1 underline text-gray-700'>Resent password</Link>


                    <button
                        type='Submit' disabled={isSubmitting} className="w-full bg-blue-500 text-white cursor-pointer py-2 rounded-md hover:bg-blue-600 mb-4 mt-5 transition">
                        {isSubmitting ? "Signning in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </>
    )
}

export default SignInForm