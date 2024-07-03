import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import Login from '../components/Login';
import Register from '../components/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../components/Firebase';
import '../components/Auth.css';
import Files from '../components/Files';

function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="App">
      <div className="auth-wrapper">
        <div>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/editor" /> : <Navigate to="/login" />} />
            <Route path="/login" element={user ? <Navigate to="/editor" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/editor" /> : <Register />} />
            <Route path="/editor" element={user ? <TextEditor /> : <Navigate to="/login" />} />
            <Route path="/files" element={user ? <Files /> : <Navigate to="/login" />} />
            <Route 
              path='/collaborate' 
              element={
                user 
                  ? <TextEditor /> 
                  : <Navigate to="/login" state={{ from: location }} replace />
              } 
            />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;