import axios from 'axios'
import React, { useState } from 'react'
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

function SignInForm({ setUser }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/auth/signIn', { email, password }, { withCredentials: true });
            if (response.status === 200) {
                setUser(response.data.user);
                toast.success(response.data.message || "Sign in successful");
                setEmail(""); setPassword("");
                navigate("/Home");
            } else {
                toast.error(response.data.message || "Sign in failed");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4'>
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                            🔐
                        </div>
                        <h2 className='text-2xl font-bold text-white'>Welcome back</h2>
                        <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder='Enter your email'
                                autoComplete='username'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className='w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition'
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete='current-password'
                                    placeholder='Enter your password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition pr-10'
                                />
                                <span className='absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-white transition'
                                    onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link to='/ForgotPassword' className='text-sm text-violet-400 hover:text-violet-300 transition'>
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold cursor-pointer py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>

                        <p className='text-center text-slate-400 text-sm pt-2'>
                            Don't have an account?{' '}
                            <Link to="/signUpForm" className="text-violet-400 font-semibold hover:text-violet-300 transition">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignInForm