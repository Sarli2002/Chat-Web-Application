import React, { useContext, useEffect,useState } from 'react'
import './rightSideBar.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const RightSidebar = () => {
    const { setUserData } = useContext(AppContext);
  const { activeChat,messages } = useContext(AppContext);
  const [msgImages,setMsgImages] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const images = messages
      .filter(msg => msg.image)  // Filter out messages with no image
      .map(msg => msg.image);    // Extract image URLs

    setMsgImages(images);
  }, [messages]);
  
 

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
  
  
  return activeChat  ? (
    <div className='rs'>
      <div className='rs-profile'>
        <img src={activeChat.avatar  || assets.blank_profile} alt="" />
        <h3>{Date.now() - activeChat.lastSeen <= 70000 ?<img className='dot' src={assets.green_dot} alt=''/>:null}{activeChat.username}</h3>
        <p>{activeChat.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url} alt="" />))}
        </div>
      </div>
      <button onClick={()=>logout()}>Logout</button>
    </div>
  ) : <div className='rs'>
    <button onClick={()=>logout()}>Logout</button>
  </div>
}

export default RightSidebar
