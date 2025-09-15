import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- NEW: Helper function to translate technical logs into plain English ---
const translateLogToAction = (log) => {
  const { http_method, endpoint } = log;

  if (endpoint.startsWith('/products')) {
    return 'Viewed Investment Products';
  }
  if (endpoint.startsWith('/invest/portfolio')) {
    return 'Viewed Your Portfolio';
  }
  if (endpoint.startsWith('/invest/wallet/deposit')) {
    return 'Deposited funds to wallet';
  }
  if (endpoint.startsWith('/invest')) {
    return 'Made a new investment';
  }
  if (endpoint.startsWith('/profile')) {
    return http_method === 'GET' ? 'Viewed Your Profile' : 'Updated Your Profile';
  }
  if (endpoint.startsWith('/auth/login')) {
    return 'Logged into account';
  }
  if (endpoint.startsWith('/logs')) {
    return 'Viewed Activity Logs';
  }

  // Default fallback for any other unhandled routes
  return `${http_method} ${endpoint}`;
};


// Helper function to format date and time
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// Helper component for status badges
const StatusBadge = ({ code }) => {
  const isSuccess = code >= 200 && code < 300;
  const badgeClass = isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const text = isSuccess ? 'Success' : 'Failed';
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
      {text}
    </span>
  );
};

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/logs', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch transaction logs');

        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [navigate]);

  if (loading) {
    return <div className="p-8 text-center">Loading your activity logs...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Activity History</h1>
      
      {/* AI Error Summarizer Card (Placeholder) */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-bold">AI Summary</h3>
        <p className="mt-2 text-sm">
          This is where an AI-powered summary of any recent errors in your activity will appear. (Coming soon!)
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateTime(log.created_at)}</td>
                  {/* USE THE TRANSLATED ACTION */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{translateLogToAction(log)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge code={log.status_code} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No activity logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Logs;

