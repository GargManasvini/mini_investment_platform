// src/components/Layout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"; // We will create this next

const Layout = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="font-sans antialiased text-gray-900 bg-gray-50 min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet /> {/* Child pages (e.g., Dashboard) will render here */}
      </main>
    </div>
  );
};

export default Layout;