import React, { useContext, useEffect,useState } from 'react'
import './rightSideBar.css'
import assets from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const RightSidebar = () => {
    const { userData, setUserData } = useContext(AppContext);
  const { activeChat,messages } = useContext(AppContext);
  const [msgImages,setMsgImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeChat) {
        const images = messages
            .filter(msg => msg.image) 
            .filter(msg => {
               const senderId = msg?.sId?._id;
                const receiverId = msg?.rId?._id;
                return (
                  (senderId === userData._id && receiverId === activeChat._id) ||
                 (senderId === activeChat._id && receiverId === userData._id)
                );
            }
            )
            .map(msg => msg.image); 

        setMsgImages(images);
    }
}, [messages, activeChat, userData]);

  const logout = async () => {
    try {
      localStorage.removeItem('token'); 
      setUserData(null); 
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
