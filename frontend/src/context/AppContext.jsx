import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backend_url } from '../App';

// Create the context
export const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);  // Store user data
  const [chatData, setChatData] = useState([]);    // Store chat data
  const [users, setUsers] = useState([]);          // Store all users data
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const [activeChat, setActiveChat] = useState(null); // Track the active chat
  const [chatVisible, setChatVisible] = useState(false); // Control visibility of the chat window
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]); // Store messages

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${backend_url}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchAllUsersData = async () => {
      try {
        const response = await axios.get(`${backend_url}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching all users data:', error);
      }
    };


    const fetchMessages = async () => {
      
        try {
          const response = await axios.get(`${backend_url}/messages/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          setMessages(response.data);
         
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      
    };

    if (token) {
      Promise.all([fetchUserData(), fetchAllUsersData(), fetchMessages()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);




  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        chatData,
        setChatData,
        users,
        setUsers,
        onlineUsers,            // Provide onlineUsers data to the context
        setOnlineUsers,        // Provide setOnlineUsers function to the context
        activeChat,
        setActiveChat,
        chatVisible,
        setChatVisible,
        messages,
        setMessages,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
