require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');


app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      // Token is not valid
      return res.sendStatus(403);
    }
    req.user = payload;
    next();
  });
};


const posts = [
  {
    username: 'Lee',
    title: 'Post 1'
  },
  {
    username: 'Mark',
    title: 'Post 2'
  }
];

app.get('/posts', authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.name));
});


app.listen(3005);