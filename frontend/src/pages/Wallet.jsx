import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '...';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(amount));
};

function Wallet() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // --- Fetch wallet balance ---
  const fetchBalance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/invest/wallet', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Could not fetch balance.');
      const data = await res.json();
      setBalance(data.balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  // --- Handle deposit form submission ---
  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositing(true);
    setError('');
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/invest/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deposit failed.');

      setSuccessMessage(`Successfully deposited ${formatCurrency(amount)}.`);
      setBalance(data.balance); // Update balance with the new value from API
      setAmount(''); // Reset input field
    } catch (err) {
      setError(err.message);
    } finally {
      setDepositing(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading your wallet...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wallet</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- Balance Display Card --- */}
        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col justify-center items-center">
          <p className="text-sm font-medium text-gray-500 uppercase">Available Balance</p>
          <p className="text-5xl font-bold text-green-600 mt-2">{formatCurrency(balance)}</p>
        </div>

        {/* --- Deposit Funds Card --- */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Deposit Funds</h2>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>}

          <form onSubmit={handleDeposit}>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (INR)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 5000"
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={depositing}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {depositing ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
