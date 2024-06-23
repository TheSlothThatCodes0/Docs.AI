import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import Login from '../components/Login';
import Register from '../components/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../components/Firebase';
import '../components/Auth.css';

function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <div className="auth-wrapper">
        <div >
          <Routes>
            <Route path="/" element={user ? <Navigate to="/editor" /> : <Navigate to="/login" />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/editor" element={user ? <TextEditor /> : <Navigate to="/login" />} />
          </Routes>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
