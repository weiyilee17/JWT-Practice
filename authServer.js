require('dotenv').config();

const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');


app.use(express.json());

let refreshTokens = [];

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s', algorithm: 'HS384' });
};

app.post('/login', (req, res) => {
  // Authenticate User

  const username = req.body.username;
  const user = { name: username };

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { algorithm: 'HS384' });

  refreshTokens.push(refreshToken);

  res.json({
    accessToken: accessToken,
    refreshToken: refreshToken
  });
});

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token);

  res.sendStatus(204);
});

app.post('/token', (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = generateAccessToken({ name: payload.name });

    res.json({ accessToken: accessToken });
  });


});




app.listen(3006);