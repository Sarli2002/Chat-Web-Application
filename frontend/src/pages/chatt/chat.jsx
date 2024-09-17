import React, { useContext, useEffect, useState } from 'react';
import './chat.css';
import LeftSidebar from '../../components/leftSideBar/leftSideBar';
import ChatBox from '../../components/chatBox/chatBox';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import RightSidebar from '../../components/rightSideBar/rightSideBar';


const Chat = () => {
  const [userData, setUserData] = useState(null);  // Store user data
  const {messages: chatData, setMessages: setChatData} = useContext(AppContext);  // Store chat data
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://chat-web-application-backend.onrender.com/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchChatData = async () => {
      try {
        const response = await axios.get('https://chat-web-application-backend.onrender.com/messages/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatData(response.data);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };

    if (token) {
      // Fetch user data and chat data concurrently, and stop loading once done
      Promise.all([fetchUserData(), fetchChatData()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false)); // In case of errors, stop loading
    } else {
      setLoading(false); // No token found, stop loading
    }
  }, [token, setChatData]);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData,userData])

  return (
    <div className='chat'>
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : (
         <div className="chat-container">
        
          <LeftSidebar />
          
          <ChatBox />
            <RightSidebar/>
            
         </div>
      )}
    </div>
  );
};

export default Chat;
