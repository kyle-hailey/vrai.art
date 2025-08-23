import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import Users from './components/Users';
import Connections from './components/Connections';
import Groups from './components/Groups';
import GroupsDiscovery from './components/GroupsDiscovery';
import GroupsSidebar from './components/GroupsSidebar';
import GroupDetail from './components/GroupDetail'; // New import

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="app-layout">
          {user && <GroupsSidebar onCollapseChange={setSidebarCollapsed} />}
          <div className={`main-content ${user ? 'with-sidebar' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              <Route path="/connections" element={<Connections />} />
              <Route
                path="/groups"
                element={
                  <ProtectedRoute>
                    <Groups />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <GroupsDiscovery />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/groups/:id" 
                element={
                  <ProtectedRoute>
                    <GroupDetail />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 