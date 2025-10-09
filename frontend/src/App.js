import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Profile from "./components/Profile";
import Navbar from './components/Navbar';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import BookSearch from './components/BookSearch';



const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        } />
        <Route path="/" element={
            <BookSearch />
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        {/* <Route path="/" element={<h1>Главная</h1>} /> */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
