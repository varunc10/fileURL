const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose')
const User = require('./models/model')
const File = require('./models/fileSchema')
const cors = require("cors"); 
require("dotenv").config();
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser'); 
const TinyURL = require('tinyurl');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Mongo Connection Open");
  })
  .catch((err) => {
    console.log("Error");
    console.log(err);
  });

const s3 = new AWS.S3();


s3.listBuckets((err, data) => {
  if (err) {
    console.error('Error listing S3 buckets:', err);
  } else {
    console.log('S3 buckets:', data.Buckets);
  }
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = './uploads';
//     fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const filename = shortid.generate() + path.extname(file.originalname);
//     cb(null, filename);
//   },
// });

const storage = multer.memoryStorage();

const upload = multer({ storage });

app.post('/api/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    const userDetails = {
      username: newUser.username,
    };

    res.status(201).json({ message: 'User registered successfully.', userDetails});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const userDetails = {
      username: user.username,
    };

    res.status(201).json({ userDetails });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/upload', upload.single('file'), async(req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }


  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${req.file.originalname}`,
    Body: req.file.buffer
  }

  try {
    const uploadResult = await s3.upload(params).promise();
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${req.file.originalname}`
    });
    TinyURL.shorten(signedUrl, async function (shortUrl, err) {
      if (err) {
        console.error('Error shortening URL:', err);
        res.status(500).json({ error: 'Internal server error.' });
      } else {
        const file = new File({
          shortLink: shortUrl,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          username: req.body.username,
        });

        await file.save();
        res.json({ shortUrl });
      }
    });
    // res.json({ signedUrl });

  } catch (error) {
    console.error('Error uploading file to S3:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
    
});

app.get('/api/files/:username', async (req, res) => {
  try {
    const username = req.params.username;

    // Find all files with the specified username
    const files = await File.find({ username });

    res.status(200).json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const deletedFile = await File.findByIdAndDelete(req.params.id);
    if (deletedFile) {
      res.json({ message: 'File deleted successfully.' });
    } else {
      res.status(404).json({ error: 'File not found.' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
