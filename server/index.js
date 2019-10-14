const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');
require('dotenv').config();

const Pusher = require('pusher');

var pusher = new Pusher({
  // connect to pusher
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
});

const {foods} = require('./data/foods.js');

const app = express();

const CHATKIT_INSTANCE_LOCATOR_ID = process.env.CHATKIT_INSTANCE_LOCATOR_ID;
const CHATKIT_SECRET_KEY = process.env.CHATKIT_SECRET_KEY;

const chatkit = new Chatkit.default({
  instanceLocator: CHATKIT_INSTANCE_LOCATOR_ID,
  key: CHATKIT_SECRET_KEY,
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use('/images', express.static('images'));

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.authenticate(socketId, channel);
  res.send(auth);
});

app.get('/foods/:query?', (req, res) => {
  const foods_r = foods();

  if (req.query.query != undefined) {
    const query = req.query.query.toLowerCase();
    return res.send({
      foods: foods_r.filter(
        itm =>
          itm.name.toLowerCase().includes(query) ||
          itm.restaurant.toLowerCase().includes(query),
      ),
    });
  }

  return res.send({
    foods: foods_r,
  });
});

app.post('/login', async (req, res) => {
  const {user_id, user_name} = req.body;

  try {
    const user = await chatkit.getUser({
      id: user_id,
    });
  } catch (err) {
    if (err.error == 'services/chatkit/not_found/user_not_found') {
      await chatkit.createUser({
        id: user_id,
        name: user_name,
      });
    }
  }

  return res.send('ok');
});

app.post('/room', async (req, res) => {
  const {room_id, room_name, user_id} = req.body;

  try {
    const room = await chatkit.getRoom({
      roomId: room_id,
      includePrivate: true,
    });

    if (room) {
      const user_rooms = await chatkit.getUserRooms({
        userId: user_id,
      });

      const room_index = user_rooms.findIndex(item => item.id == room_id);
      if (room_index == -1) {
        const add_user_to_room = await chatkit.addUsersToRoom({
          roomId: room_id,
          userIds: [user_id],
        });
      }
    }
  } catch (err) {
    if (err.error == 'services/chatkit/not_found/room_not_found') {
      await chatkit.createRoom({
        id: room_id,
        creatorId: user_id,
        name: room_name,
        isPrivate: true,
      });
    }
  }

  return res.send('ok');
});

const PORT = 5000;
app.listen(PORT, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});