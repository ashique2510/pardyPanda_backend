const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// DataBase configs
mongoose
  .connect(
    'mongodb+srv://myProject:myProject123@cluster0.coszvwd.mongodb.net/myProjectDb?retryWrites=true&w=majority'
  )
  .catch((error) => {
    console.log(error);
  });

// Schema and Model
const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Controllers and Routes

app.get('/', (req, res) => {
  res.send('express is here');
});

// Create User
app.post('/create', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('User already Exist');
  }

  // Hash password
  const Salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, Salt);

  // Creat User
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('form login', req.body);
  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid credential');
  }
});

// Generate Jwt
const generateToken = (id) => {
  return jwt.sign({ id }, 'xyz', { expiresIn: '30d' });
};

// fetch image data
app.get('/imgData', async (req, res) => {
  console.log('from backend');
  try {
    const apiResponse = await axios.get('https://picsum.photos/v2/list');
    res.json(apiResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(8000, () => {
  console.log('Express server is running...');
});
