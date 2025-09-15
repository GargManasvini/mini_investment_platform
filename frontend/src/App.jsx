// src/App.jsx

import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Component Imports
import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Page Imports
import Login from "./pages/LoginPage.jsx";
import Signup from "./pages/SignupPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Logs from "./pages/Logs.jsx";
import Investments from "./pages/Investments.jsx";
import Wallet from "./pages/Wallet.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Routes that use the main Layout (Navbar, etc.) */}
      <Route element={<Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} />}>
        
        {/* Public routes with Navbar */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetail />} />

        {/* Protected routes with Navbar */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
        <Route path="/investments" element={<PrivateRoute><Investments /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />

      </Route>

      {/* Public routes without the main navbar */}
      <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* A default route to redirect users */}
      <Route path="/" element={<Navigate to="/products" replace />} /> 
      
    </Routes>
  );
}

export default App;

