import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./components/Login";
import { ToastContainer } from 'react-toastify';
import './style/App.scss';

export const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const currency = '£';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  return (
    <div className="admin-layout">
      <ToastContainer position="top-right" theme="dark" />
      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <hr />
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/add" replace />} />
              <Route path="/add" element={<Add token={token} />} />
              <Route path="/list" element={<List token={token} />} />
              <Route path="/orders" element={<Orders token={token} />} />
              <Route path="/orders/:orderId" element={<OrderDetail token={token} />} /> 
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
