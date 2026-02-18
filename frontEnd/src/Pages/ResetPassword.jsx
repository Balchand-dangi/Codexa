import axios from 'axios';
import React, { useState } from 'react';
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
            if (response.status === 200) {
                toast.success(response.data.message || "Password reset successful!");
                navigate("/signInForm");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition";

    return (
        <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4'>
            <div className="w-full max-w-md">
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                            🔒
                        </div>
                        <h2 className='text-2xl font-bold text-white'>Reset Password</h2>
                        <p className='text-slate-400 text-sm mt-1'>Enter your new password below</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className='relative'>
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete='new-password'
                                placeholder='New password (min 8 characters)'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className={inputClass + " pr-10"}
                            />
                            <span className='absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-white transition'
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                            </span>
                        </div>

                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete='new-password'
                            placeholder='Confirm new password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={inputClass}
                        />

                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold cursor-pointer py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Resetting..." : "Reset Password"}
                        </button>

                        <p className='text-center text-slate-400 text-sm pt-1'>
                            <Link to='/signInForm' className='text-violet-400 hover:text-violet-300 transition'>
                                ← Back to Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
