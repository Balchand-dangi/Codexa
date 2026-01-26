import axios from 'axios';
import React, { useState } from 'react';
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';
import { Link, useParams, useNavigate } from 'react-router-dom';

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

        // Validation
        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`/api/auth/reset-password/${token}`, { newPassword });
            if (response.status === 200) {
                alert(response.data.message || "Password reset successful!");
                navigate("/SignInForm");
            }
        } catch (err) {
            console.log(err.message);
            if (err.response && err.response.data) {
                alert(err.response.data.message || err.response.data);
            } else {
                alert("Something went wrong");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className='flex justify-center items-center min-h-screen bg-gray-400'>
                <form onSubmit={handleSubmit} className="bg-white/80 p-6 rounded-xl shadow-md w-90">
                    <h2 className='text-2xl font-bold mb-4 text-center'>Reset Password</h2>
                    <p className='text-sm text-gray-600 text-center mb-6'>
                        Enter your new password below
                    </p>

                    <div className='relative mb-3'>
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete='new-password'
                            placeholder='Enter new password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                        />
                        <span
                            className='absolute right-3 top-3.5 cursor-pointer'
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                        </span>
                    </div>

                    <div className='relative mb-3'>
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete='new-password'
                            placeholder='Confirm new password'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white cursor-pointer py-2 rounded-md hover:bg-blue-600 mb-4 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>

                    <div className='text-center'>
                        <Link to='/SignInForm' className='text-sm underline text-gray-700'>
                            Back to Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default ResetPassword;
