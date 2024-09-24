const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const User = require('./models/user');  
const Message = require('./models/message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
dotenv.config(); // Load environment variables
app.use(express.json()); // To handle JSON payloads
app.use(cors({
  origin: true, // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // If you want to allow cookies or auth headers
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));


// Multer configuration for file uploads
const mediaStorage = multer.diskStorage({
  destination: './tmp/media/', 
  filename: (req, file, cb) => {
     cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`); 
  }
});
const upload = multer({ storage: mediaStorage });

// Serve static files from the uploads folder
app.use('/media', express.static('upload/media'));

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `${process.env.BACKEND_URL}/media/${req.file.filename}`;
  console.log('Uploaded file URL:', imageUrl);
  res.status(200).json({ imageUrl });
});



//Multer configuration for user avatar uploads
const avatarStorage = multer.diskStorage({
  destination: './tmp/avatars/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);  
  }
});

// Only allow image files for avatar uploads
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
  }
});

// Serve static files from the uploads folder
app.use('/avatars', express.static('upload/avatars'));

// Signup Route
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  await newUser.save();

  const token = jwt.sign({ id: newUser._id}, process.env.JWT_SECRET);

  // Send the token in response
  res.status(201).json({
    message: 'User signed up successfully',
    token: token, // Send the token
  });

});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).send('Invalid credentials');

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(200).json({ token });
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err); // Log the error for debugging
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};



// Route to check authentication
app.get('/check', authenticateJWT, (req, res) => {
  res.status(200).json({ authenticated: true, user: req.user });
});

// Get all users route
app.get('/users', authenticateJWT, async (req, res) => {
  try {
    const users = await User.find({}, 'username avatar bio lastSeen _id'); // Include _id field
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err); // Log the error
    res.status(500).json({ message: 'Error fetching users' });
  }
});


// Route to get current authenticated user's data
app.get('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the JWT payload
    const user = await User.findById(userId).select('username avatar bio lastSeen');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user); // Send back the user's data
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user data' });
  }
});


// Endpoint to upload user avatar and update bio
app.put('/updateProfile', authenticateJWT, avatarUpload.single('avatar'), async (req, res) => {
  try {
    const { bio } = req.body;  // Get bio from request body

    let avatarUrl;

    // If an avatar file is uploaded, process the file upload
    if (req.file) {
      avatarUrl = `${process.env.BACKEND_URL}/avatars/${req.file.filename}`;  // Save the URL to the avatar
    }

    // Extract user ID from JWT
    const userId = req.user.id;

    // Create an object with fields to update
    const updateFields = {};

    if (avatarUrl) {
      updateFields.avatar = avatarUrl;
    }

    if (bio) {
      updateFields.bio = bio;
    }

    // Update the user's avatar and bio in the database
    const user = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }  // Return the updated document
    );

    // If user not found
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return success response with updated user data
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        lastSeen: user.lastSeen,
      }
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Get chat messages for the logged-in user
app.get('/messages', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT

    const messages = await Message.find({
      $or: [{ sId: userId }, { rId: userId }]
    }).populate('sId rId', 'username avatar'); // Populate user details (sender and receiver)

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});




// Socket.IO events
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', async ({ userId }) => {
    socket.userId = userId;

    const user = await User.findById(userId);
    if (user) {
      io.emit('userOnline', { userId: user._id, username: user.username, avatar: user.avatar });
      console.log(`User ${user.username} joined`);
    }
  });

  socket.on('sendMessage', async (messageData) => {
    const { sId, rId, text, image } = messageData;
    console.log('sendMessage', messageData);
    if (!sId || !rId) {
      console.error('Missing sId or rId'); // Log an error if IDs are missing
      return;
    }
    const newMessage = new Message({
      sId,
      rId,
      text,
      image,
    });
    await newMessage.save();
    io.emit('newMessage', { sId, rId, text, image, createdAt: newMessage.createdAt });
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      const user = await User.findById(socket.userId);
      if (user) {
        user.lastSeen = Date.now();
        await user.save();
        io.emit('userOffline', { userId: user._id });
        console.log(`User ${user.username} disconnected`);
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
