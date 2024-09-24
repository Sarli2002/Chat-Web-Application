import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import Chat from './pages/chatt/chat';
import Login from './pages/login/login';
import ProfileUpdate from './pages/profile/profile';
export const backend_url = process.env.REACT_APP_BACKEND_URL;
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
 

  useEffect(() => {
    if (!token) {
      setLoading(false);
      navigate('/');
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3001/check', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.authenticated) {
          setUser(response.data.user);
          navigate('/chat');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  if (loading) {
    // Render a loading spinner or some placeholder content
    return <div>Loading...</div>;
  }

  return (
    <>
    <ToastContainer />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/chat" element={user ? <Chat /> : <Navigate to="/" />} />
      <Route path="/profile" element={<ProfileUpdate />} />
    </Routes>
    </>
  );
};

export default App;
