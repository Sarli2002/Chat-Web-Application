import React, { useEffect, useRef, useState, useContext } from 'react';
import './chatBox.css';
import assets from '../../assets/assets';
import axios from 'axios';
import { io } from 'socket.io-client';
import { backend_url } from '../../App';
import { AppContext } from '../../context/AppContext'; 

const ChatBox = () => {
  const { userData, activeChat: chatUser, chatVisible, setChatVisible, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [localmessages, setLocalMessages] = useState([]);
  const scrollEnd = useRef();
  const socket = useRef();
  

  useEffect(() => {
    // Filter global messages for the active chat user
    if (chatUser && userData) {
      const filteredMessages = messages.filter((msg) => {
        const senderId = msg?.sId?._id;
        const receiverId = msg?.rId?._id;
        return (
          (senderId === userData._id && receiverId === chatUser._id) ||
          (senderId === chatUser._id && receiverId === userData._id)
        );
      });
      setLocalMessages(filteredMessages);
      console.log(filteredMessages);
    }
  }, [messages, chatUser, userData]); 


  useEffect(() => {
    // Initialize Socket.IO client connection
    socket.current = io(`${backend_url}`); // Update this to your backend URL

    // Join chat room with the current user
    if (userData) {
      socket.current.emit('join', { userId: userData.id });
    }

    // Listen for incoming messages
    socket.current.on('newMessage', (newMessage) => {
      //setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessages((prevMessages) => [...prevMessages, newMessage]); 
    });

    return () => {
      socket.current.disconnect();
    };
  }, [userData, setMessages]);

  // Function to send a message
  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        sId: { _id: userData._id } , 
        rId: { _id: chatUser._id },  
        text: input.trim(),
        createdAt: new Date().toISOString(), // Add current timestamp
      };
  
      // Emit the message via Socket.IO
      socket.current.emit('sendMessage', newMessage);
      
  
      // Clear the input after sending
      setInput('');
    }
  };
  
  

  // Function to send an image
  const sendImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Upload the image to your backend
        const response = await axios.post(`${backend_url}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const fileUrl = response.data.imageUrl;
       
        const newMessage = {
          sId: { _id: userData._id },  
          rId: { _id: chatUser._id },  
          image: fileUrl,
          createdAt: new Date().toISOString(), // Add current timestamp
        };
        socket.current.emit('sendMessage', newMessage);
        
     
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

 
  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localmessages]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible ? '' : 'hidden'}`}>
      <div className="chat-user">
        <img src={chatUser.avatar || assets.blank_profile} alt="Chat User Avatar" />
        <p>
          {chatUser.username}
        </p>
        <img
          onClick={() => setChatVisible(false)}
          className="arrow"
          src={assets.arrow_icon}
          alt="Close Chat"
        />
        <img className="help" src={assets.help_icon} alt="Help" />
      </div>

<div className={`chat-msg`}>
  <div ref={scrollEnd}></div>
  {localmessages
    .slice() 
    .reverse() 
    .map((msg, index) => {
      const isSentByUser = msg?.sId?._id === userData?._id;
      
      return (
        <div key={index} className={isSentByUser ? 's-msg' : 'r-msg'}>
          {msg.image ? (
            <img className="msg-img" src={msg.image} alt="Message" />
          ) : (
            <p className="msg">{msg.text}</p>
          )}
          <div className="msg-info">
            <img
              src={isSentByUser ? userData.avatar || assets.blank_profile : chatUser.avatar || assets.blank_profile}
              alt={isSentByUser ? "Your Avatar" : "Chat User Avatar"}
            />
            <p>{new Date(msg.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
      );
    })}
</div>

      <div className="chat-input">
      <input onKeyDown={(e) => e.key === "Enter" ? sendMessage() : null} onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder='Send a message' />
      <input onChange={sendImage} type="file" id='image' accept="image/png, image/jpeg" hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="Attach" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="Send" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible ? '' : 'hidden'}`}>
      <img src={assets.logo_icon} alt="Logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
