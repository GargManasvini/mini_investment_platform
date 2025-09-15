import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '...';
  if (typeof amount !== 'number' && typeof amount !== 'string') return '';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
};

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [amount, setAmount] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [investing, setInvesting] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productRes = await fetch(`http://localhost:5000/products/${productId}`);
        if (!productRes.ok) throw new Error('Product not found.');
        const productData = await productRes.json();
        setProduct(productData);
        setAmount(productData.min_investment || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const handleInvest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setInvesting(true);
    setError(null);
    setSuccessMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Investment failed. Please check your wallet balance.');

      setSuccessMessage(`Successfully invested ${formatCurrency(amount)}! You will be redirected to your portfolio.`);
      setTimeout(() => navigate('/investments'), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product details...</div>;
  if (error && !product) return <div className="p-8 text-center text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-gray-600 mb-6">{product.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-b border-gray-200 py-6 mb-6">
          <div><p className="text-sm text-gray-500">Annual Yield</p><p className="text-lg font-semibold text-green-600">{product.annual_yield}%</p></div>
          <div><p className="text-sm text-gray-500">Risk Level</p><p className="text-lg font-semibold capitalize">{product.risk_level}</p></div>
          <div><p className="text-sm text-gray-500">Tenure</p><p className="text-lg font-semibold">{product.tenure_months} months</p></div>
          <div><p className="text-sm text-gray-500">Type</p><p className="text-lg font-semibold uppercase">{product.investment_type}</p></div>
        </div>

        <form onSubmit={handleInvest}>
          <h2 className="text-xl font-semibold mb-4">Make an Investment</h2>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{successMessage}</div>}

          <div className="flex items-end space-x-4">
            <div className="flex-grow">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Investment Amount (INR)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={product.min_investment || 0}
                max={product.max_investment || undefined}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Min: ${formatCurrency(product.min_investment)}`}
              />
            </div>
            <button type="submit" disabled={investing || !isAuthenticated} className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {investing ? 'Processing...' : (isAuthenticated ? 'Invest Now' : 'Login to Invest')}
            </button>
          </div>
           {!isAuthenticated && <p className="text-xs text-gray-500 mt-2">You must be logged in to make an investment.</p>}
        </form>
      </div>
    </div>
  );
}

export default ProductDetail;

