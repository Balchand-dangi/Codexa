import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); 
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`/api/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                
                setTimeout(() => {
                    navigate('/signInForm');
                }, 2000);
                
            } catch (error) {
                setStatus('error');
                setMessage(
                    error.response?.data?.message || 
                    'Verification failed. Link may be invalid or expired.'
                );
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
            <div className="bg-white p-8 rounded-xl shadow-md w-96 text-center">
                {status === 'verifying' && (
                    <>
                        <div className="mb-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Verifying Email...</h2>
                        <p className="text-gray-600">Please wait</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
                        <p className="text-gray-700 mb-4">{message}</p>
                        <p className="text-sm text-gray-500">Redirecting to sign in page...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
                        <p className="text-gray-700 mb-4">{message}</p>
                        
                        <button
                            onClick={() => navigate('/about')}
                            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                        >
                            Go to support page
                        </button>
                        <p>Contact to support team.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
