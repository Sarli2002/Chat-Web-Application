import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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

  const token = localStorage.getItem('token'); // Assuming token is stored in localStorage

  // Fetch user and chat data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    // const fetchChatData = async () => {
    //   try {
    //     const response = await axios.get('http://localhost:3001/messages/', {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setChatData(response.data);
    //     console.log(response.data);
    //   } catch (error) {
    //     console.error('Error fetching chat data:', error);
    //   }
    // };

    const fetchAllUsersData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching all users data:', error);
      }
    };

    if (token) {
      Promise.all([fetchUserData(), fetchAllUsersData()])
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle socket events for online and offline users


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
