import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- Helper Component for Risk Level Badges ---
// This component returns a colored badge based on the risk level for better UI.
const RiskBadge = ({ level }) => {
  const badgeStyles = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[level.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
      {level} Risk
    </span>
  );
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/products');
        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs only once on mount

  // --- Render States ---

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading investment products...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Investment Products</h1>
        {/* Placeholder for future filter/search controls */}
      </div>

      {/* --- Products Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
                  <RiskBadge level={product.risk_level} />
                </div>
                <p className="text-sm text-gray-500 capitalize mb-4">{product.investment_type}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Annual Yield</p>
                    <p className="text-lg font-semibold text-green-600">{product.annual_yield}%</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Tenure</p>
                    <p className="text-lg font-semibold text-gray-800">{product.tenure_months} months</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="bg-gray-50 p-4 mt-auto">
                <Link
                  to={`/products/${product.id}`} // Link to the future detail page
                  className="w-full text-center block bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  View Details & Invest
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No investment products are available at this time.</p>
        )}
      </div>
    </div>
  );
}

export default Products;
