import React, { useState, useEffect } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import assets from '../../assets/assets';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [currState, setCurrState] = useState("Login");  // Default state to "Login"
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");  // Set default email to guest@gmail.com
  const [password, setPassword] = useState("");  // Set default password to password
  const navigate = useNavigate(); 

  useEffect(() => {
    if (currState === "Login") {
     setEmail('guest@gmail.com')
     setPassword('password')
    }
    else{
      setEmail("")
      setPassword("")
    }
  }, [currState]);

  // Handle form submission for both sign up and login
  const onSubmitHandler = async (event) => {
    event.preventDefault();   

    if (currState === "Sign up") {
      // Sign up logic using your MongoDB backend
      try {
        const response = await axios.post('https://chat-web-application-backend.onrender.com/signup', {username, email, password });
        toast.success('Account created successfully!');
        localStorage.setItem('token', response.data.token);
        navigate('/chat'); 
      } catch (error) {
        console.error('Signup error:', error.response.data.message);
        toast.error('Error creating account. Please try again.');
      }
    } else {
      // Login logic using your MongoDB backend
      try {
        const response = await axios.post('https://chat-web-application-backend.onrender.com/login', { email, password });
        toast.success('Login successful!');
        // Save the JWT token or any other required data from the response
        localStorage.setItem('token', response.data.token);
        navigate('/chat'); 
      } catch (error) {
        console.error('Login error:', error.response.data.message);
        toast.error('Error logging in. Please check your credentials.');
      }
    }
  }

  return (
    <div className='login'>
      <img className='logo' src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} className='login-form' >
        <h2>{currState}</h2>
        {currState === "Sign up" && (
          <input 
            onChange={(e) => setUserName(e.target.value)} 
            value={username} 
            className='form-input' 
            type="text" 
            placeholder='Username' 
            required 
          />
        )}
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          className='form-input' 
          type="email" 
          placeholder='Email address' 
          required 
        />
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          className='form-input' 
          type="password" 
          placeholder='Password' 
          required 
        />
        <button type='submit'>
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>
        <div className='login-term'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>
        <div className='login-forgot'>
          {
            currState === "Sign up"
              ? <p className='login-toggle'>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
              : <p className='login-toggle'>Create an account <span onClick={() => setCurrState("Sign up")}>Sign up here</span></p>
          }
        </div>
      </form>
    </div>
  );
}

export default Login;
