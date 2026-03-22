import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages Imports
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import AdminRegister from "./pages/AdminRegister";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === AUTH ROUTES === */}
        {/* Default route is Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        
        {/* Registration & Recovery */}
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* === MAIN APPLICATION ROUTE === */}
        {/* Dito lang dapat tayo sa /dashboard. 
          Ang Reports, Inventory, at Employees ay switchable na sa loob nito 
          gamit ang 'page' state sa Dashboard.js mo.
        */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Catch-all route: Redirect back to login if path doesn't exist */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;