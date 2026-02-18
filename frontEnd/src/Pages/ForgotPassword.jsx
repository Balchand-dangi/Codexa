import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response.status === 200) {
        setSuccessMsg(response.data.message);
        setEmail("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4'>
      <div className="w-full max-w-md">
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
              🔑
            </div>
            <h2 className='text-2xl font-bold text-white'>Forgot Password?</h2>
            <p className='text-slate-400 text-sm mt-1'>Enter your email and we'll send you a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder='Enter your email'
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition'
            />

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
                {successMsg}
              </div>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold cursor-pointer py-2.5 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-violet-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>

            <p className='text-center text-slate-400 text-sm pt-1'>
              Remember it?{' '}
              <Link to="/signInForm" className="text-violet-400 font-semibold hover:text-violet-300 transition">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
