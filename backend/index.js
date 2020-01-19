require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ip = require('ip');
const { StreamChat } = require('stream-chat');
const app = express();

// Add the middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize the Stream Chat client
const streamClient = new StreamChat(process.env.KC_STREAM_CHAT_KEY, process.env.KC_STREAM_CHAT_SECRET);

app.get('/api/kongchat/ping', (req, res) => {
  return res.json({ message: 'pong' });
});

app.post('/api/kongchat/token', (req, res) => {
  const { body: { username } } = req;

  // generate a Stream Chat token for use by the user making the request
  return res.json({ user: { username }, token: streamClient.createToken(username) });
});

app.listen(10000, () => {
  console.log(`API running on http://${ip.address()}:10000`);
});
