import React, { useContext, useState, useEffect } from 'react';
import './profile.css';
import assets from '../../assets/assets';
import axios from 'axios'; 
import { backend_url } from '../../App';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
  const [image, setImage] = useState(null);
  const [bio, setBio] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(AppContext);
  const token = localStorage.getItem('token');
  useEffect(() => {
    if (userData) {
      setPrevImage(userData.avatar);  
      setBio(userData.bio || "");     
    }
  }, [userData]);


  const profileUpdate = async (event) => {
    event.preventDefault();

    try {
      
      if (!prevImage && !image) {
        toast.error("Please upload a profile picture");
        return;
      }

      // Form data to hold profile details
      let formData = new FormData();
      formData.append('bio', bio || userData.bio);  // Default to current bio if not changed

      // If a new image is selected, add it to formData
      if (image) {
        formData.append('avatar', image);
      }

     
      const response = await axios.put(`${backend_url}/updateProfile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state and global user data context
      setUserData(response.data.user);  // Assuming the updated user data is returned
      setPrevImage(response.data.user.avatar);  // Update avatar URL in the local state
      toast.success('Profile updated successfully!');
      navigate('/profile');
       
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className='profile'>
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile details</h3>

          {/* Profile image upload */}
          <label htmlFor='avatar'>
            <input 
              onChange={(e) => setImage(e.target.files[0])} 
              id='avatar' 
              type="file" 
              accept=".png, .jpg, .jpeg" 
              hidden 
            />
            <img 
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon} 
              alt="Profile avatar" 
              className="avatar-preview" 
            />
            Upload profile image
          </label>

          {/* Bio text area */}
          <textarea 
            onChange={(e) => setBio(e.target.value)} 
            value={bio} 
            placeholder='Write profile bio' 
            required 
          />

          {/* Save button */}
          <button type="submit">Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon} alt="" />
      </div>
    </div>
  );
};

export default ProfileUpdate;
