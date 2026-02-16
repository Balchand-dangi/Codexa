import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      if (response.status === 200) {
        setMessage(response.data.message);
        setEmail("");
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
      <div className='flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500'>
        <form onSubmit={handleSubmit} className="bg-white/80 p-6 rounded-xl shadow-md w-90">
          <h2 className='text-2xl font-bold mb-4 text-center'>Forgot Password?</h2>
          <p className='text-sm text-gray-600 text-center mb-6'>
            Enter your email and we'll send you a reset link
          </p>

          <input
            type="email"
            placeholder='Enter your email'
            autoComplete='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
          />

          {message && (
            <p className='text-sm text-red-600 mb-3 text-center'>{message}</p>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white cursor-pointer py-2 rounded-md hover:bg-blue-700 mb-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send Reset request"}
          </button>


          <div className='flex justify-center'>Back to -
            <Link to="/signInForm" style={{ color: "green", fontWeight: "bold", textDecoration: "underline" }}>Sign in</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default ForgotPassword;
