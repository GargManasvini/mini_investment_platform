import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// --- Helper Functions for Formatting ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// --- Helper Component for Status Badges ---
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    matured: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusStyles[status.toLowerCase()] || ''}`}>
      {status}
    </span>
  );
};


function Investments() {
  const [portfolio, setPortfolio] = useState({ summary: {}, investments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/invest/portfolio', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch portfolio data');
        
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [navigate]);

  if (loading) {
    return <div className="p-8 text-center">Loading your investments...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Investments</h1>

      {/* --- Summary Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(portfolio.summary?.totalInvested || 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Expected Total Return</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(portfolio.summary?.totalExpected || 0)}
          </p>
        </div>
      </div>

      {/* --- Detailed Investments Table --- */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Invested</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invested On</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maturity Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Return</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolio.investments.length > 0 ? (
              portfolio.investments.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(inv.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.invested_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.maturity_date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatCurrency(inv.expected_return)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={inv.status} /></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  You haven't made any investments yet. 
                  <Link to="/products" className="text-indigo-600 hover:underline ml-1 font-medium">
                    Explore products
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Investments;
