import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState(1); // Controls which form is shown: 1 for email, 2 for OTP/password

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Stage 1: Request the reset OTP ---
  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch("http://localhost:5000/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request.");
      
      setMessage("OTP has been generated. Please check the backend server console to retrieve it.");
      setStage(2); // Move to the next stage
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Stage 2: Submit OTP and new password ---
  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch("http://localhost:5000/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password reset failed.");
      
      alert("Password reset successful! You will be redirected to the login page.");
      navigate("/login"); // Navigate programmatically
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        {/* --- STAGE 1 FORM: Enter Email --- */}
        {stage === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Forgot Password?</h2>
              <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset OTP.</p>
            </div>
            
            <form className="space-y-6" onSubmit={requestReset}>
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Request OTP'}
                </button>
              </div>
            </form>
            <p className="text-sm text-center text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log in</Link>
            </p>
          </>
        )}

        {/* --- STAGE 2 FORM: Enter OTP & New Password --- */}
        {stage === 2 && (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
              <p className="mt-2 text-sm text-gray-600">An OTP has been sent. Please check the server console.</p>
            </div>
            
            <form className="space-y-6" onSubmit={resetPassword}>
              {message && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{message}</div>}
              {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
              <div>
                <label htmlFor="otp" className="text-sm font-medium text-gray-700">OTP</label>
                <input id="otp" type="text" placeholder="Enter the 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                <input id="newPassword" type="password" placeholder="Enter your new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
