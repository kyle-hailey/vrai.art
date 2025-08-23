import React from 'react';
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

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="app-layout">
          {user && <GroupsSidebar />}
          <div className={`main-content ${user ? 'with-sidebar' : ''}`}>
            <Routes>
              <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
              <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
              <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
              <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
              <Route 
                path="/create-post" 
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/posts/:id" 
                element={
                  <ProtectedRoute>
                    <PostDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users/:username" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/connections" 
                element={
                  <ProtectedRoute>
                    <Connections />
                  </ProtectedRoute>
                } 
              />
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