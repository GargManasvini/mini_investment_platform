import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// --- New Component: Password Strength Meter ---
const PasswordStrengthMeter = ({ feedback }) => {
  if (!feedback) return null;

  const { strength, suggestions } = feedback;

  const strengthColors = {
    'Very Weak': 'bg-red-500',
    'Weak': 'bg-orange-500',
    'Moderate': 'bg-yellow-500',
    'Strong': 'bg-green-500',
    'Very Strong': 'bg-emerald-500',
  };

  const strengthWidths = {
    'Very Weak': 'w-1/5',
    'Weak': 'w-2/5',
    'Moderate': 'w-3/5',
    'Strong': 'w-4/5',
    'Very Strong': 'w-full',
  };

  return (
    <div className="mt-2 text-sm">
      <div className="flex justify-between items-center mb-1">
        <p className="font-medium text-gray-700">Password Strength: {strength}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${strengthColors[strength]} ${strengthWidths[strength]} transition-all duration-300`}></div>
      </div>
      {suggestions && suggestions.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-gray-600">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
};


function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null); // State for AI feedback
  const navigate = useNavigate();

  // --- NEW: useEffect to check password strength in real-time ---
  useEffect(() => {
    // A small delay (debounce) to avoid calling the API on every single keystroke
    const timer = setTimeout(() => {
      if (password) {
        fetch('http://localhost:5000/auth/password-strength', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        })
        .then(res => res.json())
        .then(data => setPasswordFeedback(data))
        .catch(err => console.error("Failed to check password strength", err));
      } else {
        setPasswordFeedback(null); // Clear feedback if password is empty
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer); // Cleanup timer on component unmount or password change
  }, [password]);


  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      alert("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join to start managing your investments</p>
        </div>
        <form className="space-y-6" onSubmit={handleSignup}>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
            <div className="w-full">
              <label htmlFor="first-name" className="text-sm font-medium text-gray-700">First Name</label>
              <input id="first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="w-full">
              <label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last Name</label>
              <input id="last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            {/* --- Display the Password Strength Meter --- */}
            <PasswordStrengthMeter feedback={passwordFeedback} />
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
