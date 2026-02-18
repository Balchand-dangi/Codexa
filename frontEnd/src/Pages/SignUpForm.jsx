import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [skills, setSkills] = useState("");
    const [college, setCollege] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setSuccessMsg("");

        const userData = { name, email, password, age, skills, college };
        try {
            const response = await axios.post("/api/auth/signUp", userData);
            const msg = response.data.message || response.data;
            setSuccessMsg(msg);
            toast.success(msg);
            setName(""); setEmail(""); setPassword(""); setAge(""); setSkills(""); setCollege("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                            🚀
                        </div>
                        <h2 className="text-2xl font-bold text-white">Create account</h2>
                        <p className="text-slate-400 text-sm mt-1">Join the Codexa community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass + " pr-10"}
                            />
                            <span className="absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-white transition"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                            </span>
                        </div>

                        <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
                        <input type="text" placeholder="Skills (e.g. React, Node.js)" value={skills} onChange={(e) => setSkills(e.target.value)} className={inputClass} />
                        <input type="text" placeholder="College / University name" value={college} onChange={(e) => setCollege(e.target.value)} className={inputClass} />

                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold cursor-pointer py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isSubmitting ? "Creating account..." : "Sign Up"}
                        </button>

                        <p className='text-center text-slate-400 text-sm pt-1'>
                            Already have an account?{' '}
                            <Link to="/signInForm" className="text-violet-400 font-semibold hover:text-violet-300 transition">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;
