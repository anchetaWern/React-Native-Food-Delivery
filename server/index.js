const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
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

const PORT = 5000;
app.listen(PORT, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});