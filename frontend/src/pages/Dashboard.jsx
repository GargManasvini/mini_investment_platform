import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Helper Functions ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

// --- UI Components ---

// Enhanced Risk Chart with better visuals
const RiskDistributionChart = ({ distribution }) => {
  if (!distribution || Object.keys(distribution).length === 0) return null;
  const riskLevels = [
    { label: 'Low', value: parseFloat(distribution.low || 0), color: 'bg-green-500' },
    { label: 'Moderate', value: parseFloat(distribution.moderate || 0), color: 'bg-yellow-500' },
    { label: 'High', value: parseFloat(distribution.high || 0), color: 'bg-red-500' },
  ];
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-700 mb-2">Portfolio Risk Distribution</p>
      <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {riskLevels.map(level => level.value > 0 && (
          <div key={level.label} className={level.color} style={{ width: `${level.value}%` }} title={`${level.label} Risk: ${level.value}%`}></div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {riskLevels.map(level => level.value > 0 && <div key={level.label}><span className={`inline-block w-2 h-2 rounded-full mr-1 ${level.color}`}></span>{level.label}: {level.value}%</div>)}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
function Dashboard() {
  const [user, setUser] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const responses = await Promise.all([
          fetch('http://localhost:5000/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/invest/portfolio', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/invest/portfolio/insights', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        for (const res of responses) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          if (!res.ok) throw new Error('One or more data fetches failed.');
        }

        const [profile, portfolio, aiInsights] = await Promise.all(responses.map(res => res.json()));
        
        setUser(profile);
        setPortfolioData(portfolio);
        setInsights(aiInsights);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading your dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* --- Personalized Greeting --- */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
        <p className="text-gray-600">Here's a summary of your investment portfolio.</p>
      </div>
      
      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Portfolio Value</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(portfolioData?.summary?.totalExpected || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Invested</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(portfolioData?.summary?.totalInvested || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Investments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{portfolioData?.investments?.length || 0}</p>
        </div>
      </div>
      
      {/* --- AI Insights Section --- */}
      <div className="bg-indigo-100 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">AI Portfolio Insights</h3>
        <p className="text-sm text-indigo-800">{insights?.summary || 'AI insights are being generated...'}</p>
        {insights?.distribution && <RiskDistributionChart distribution={insights.distribution} />}
      </div>
    </div>
  );
}

export default Dashboard;

