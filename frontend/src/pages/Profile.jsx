import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [riskAppetite, setRiskAppetite] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // --- Fetch user data on component mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch profile data');

        const data = await res.json();
        setUser(data);
        setRiskAppetite(data.risk_appetite); // Set initial value for the dropdown
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // --- Handle form submission ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ risk_appetite: riskAppetite }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      setSuccessMessage('Your risk appetite has been updated successfully!');
      // Optionally update user state if more fields were updated
      setUser(prev => ({...prev, risk_appetite: riskAppetite}));

    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Profile</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-md">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}

        {/* Display User Information */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="text-lg font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
        </div>
        <div className="mb-8">
          <p className="text-sm text-gray-500">Email Address</p>
          <p className="text-lg font-medium text-gray-800">{user?.email}</p>
        </div>

        <hr className="my-8" />

        {/* Update Risk Appetite Form */}
        <form onSubmit={handleUpdateProfile}>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Your Risk Appetite</h2>
          <p className="text-sm text-gray-600 mb-4">
            This helps us recommend the right investment products for you.
          </p>
          <div>
            <label htmlFor="riskAppetite" className="block text-sm font-medium text-gray-700 mb-2">
              Select your risk level
            </label>
            <select
              id="riskAppetite"
              value={riskAppetite}
              onChange={(e) => setRiskAppetite(e.target.value)}
              className="block w-full max-w-xs px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
