// src/components/leftSideBar/leftSideBar.js
import React, { useEffect, useState, useContext } from 'react';
import './leftSideBar.css';
import assets from '../../assets/assets'
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext'; // Import the AppContext
import { useNavigate } from 'react-router-dom';


const LeftSidebar = () => {
  const { chatVisible, userData,setUserData, users, onlineUsers, setActiveChat, setChatVisible } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const navigate = useNavigate();

  useEffect(() => {
    // Filter users based on the search query
    if (searchQuery) {
      const results = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(results);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const startChatWithUser = (user) => {
    try {
      setActiveChat(user);  // Set the active chat with the selected user
      setChatVisible(true); // Show the chat window
    } catch (error) {
      toast.error('Failed to start a chat. Please try again.');
    }
  };

  const logout = async () => {
    try {
      // Clear user data from local storage or context
      localStorage.removeItem('token'); // Assuming you store JWT in local storage
      setUserData(null); // Reset user data in the context

      // Navigate to login or home page after logout
      navigate('/login');
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className= {`left-sidebar ${chatVisible ? "hidden" : ""}`}>
      <div className='ls-top'>
        <div className='ls-nav'>
          <img className='logo' src={assets.logo} alt="" />
          <div className='menu'>
            <img src={assets.menu_icon} alt="" />
            <div className='sub-menu'>
              <button onClick={() => { navigate('/profile'); }}>
                Edit Profile
              </button>
              <hr />
              <button onClick={() => logout()}>
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="ls-list">
        {filteredUsers.map(user => (
          <div
            key={user._id}
            className={`${onlineUsers.has(user._id) ? 'online' : 'offline'} friends`}
            onClick={() => startChatWithUser(user)} 
          >
            <img src={user.avatar || assets.blank_profile } className="profilepic" alt="avatar" />
            <div>
              <strong>{user.username}</strong>
              {userData && user._id === userData._id ? ' (You)' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
