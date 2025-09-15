import { NavLink, useNavigate } from "react-router-dom";
import Logo from './Logo.jsx'; // <-- FIX: Added .jsx extension for clarity

export default function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate("/login");
  };

  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100";
  const activeLinkClasses = "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Brand and Main Navigation */}
          <div className="flex items-center">
            {/* --- UPDATED: Use the Logo component --- */}
            <NavLink to={isAuthenticated ? "/dashboard" : "/login"}>
              <Logo />
            </NavLink>
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>Dashboard</NavLink>
                  <NavLink to="/products" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>Products</NavLink>
                  <NavLink to="/investments" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>Investments</NavLink>
                  <NavLink to="/wallet" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>Wallet</NavLink>
                  <NavLink to="/logs" className={({ isActive }) => isActive ? `${navLinkClasses} ${activeLinkClasses}` : navLinkClasses}>Logs</NavLink>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: User Info and Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="text-sm font-medium text-gray-700 hover:text-gray-900">Profile</NavLink>
                <button onClick={handleLogoutClick} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Login</NavLink>
                <NavLink to="/signup" className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Signup</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

