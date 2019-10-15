const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');
const PushNotifications = require('@pusher/push-notifications-server');
require('dotenv').config();

const crypto = require('crypto');

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

const CHATKIT_WEBHOOK_SECRET = process.env.CHATKIT_WEBHOOK_SECRET;

const beamsClientDriver = new PushNotifications({
  instanceId: process.env.BEAMS_INSTANCE_ID_DRIVER,
  secretKey: process.env.BEAMS_SECRET_KEY_DRIVER,
});

const beamsClientCustomer = new PushNotifications({
  instanceId: process.env.BEAMS_INSTANCE_ID_CUSTOMER,
  secretKey: process.env.BEAMS_SECRET_KEY_CUSTOMER,
});

const push_types = {
  driver_accepted_order: {
    title: 'Order accepted',
    body: '[data] has accepted your order',
  },
  driver_picked_order: {
    title: 'Picked up order',
    body: '[data] has picked up your order from the restaurant',
  },
  driver_delivered_order: {
    title: 'Order delivered',
    body: '[data] has delivered your order',
  },
  driver_sent_message: {
    title: 'New message',
    body: '[data]',
  },

  customer_confirmed: {
    title: 'Customer confirmed',
    body: '[data] has confirmed',
  },
  customer_sent_message: {
    title: 'New message',
    body: '[data]',
  },
};

app.use(
  bodyParser.text({
    type: req => {
      const contype = req.headers['content-type'];
      if (contype === 'application/json') {
        return true;
      }
      return false;
    },
  }),
);

app.use(
  bodyParser.json({
    type: req => {
      const contype = req.headers['content-type'];
      if (contype !== 'application/json') {
        return true;
      }
      return false;
    },
  }),
);

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());
app.use('/images', express.static('images'));

const verifyRequest = req => {
  const signature = crypto
    .createHmac('sha1', CHATKIT_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  return signature === req.get('webhook-signature');
};

const getUser = async user_id => {
  try {
    const user = await chatkit.getUser({
      id: user_id,
    });
    return user;
  } catch (err) {
    console.log('error getting user: ', err);
    return false;
  }
};

const publishNotification = async (user_type, order_id, title, body) => {
  const beamsClient =
    user_type == 'driver' ? beamsClientCustomer : beamsClientDriver;

  try {
    await beamsClient.publishToInterests([order_id], {
      fcm: {
        notification: {
          title,
          body,
        },
      },
    });
  } catch (err) {
    console.log('error publishing push notification: ', err);
  }
};

const notifyUser = async ({payload}) => {
  try {
    const msg = payload.messages[0];
    const sender_id = msg.user_id;
    const sender = await getUser(sender_id);

    const message = msg.parts[0].content.substr(0, 37) + '...';
    const order_id = msg.room_id;

    const user_type = sender.custom_data.user_type;

    const push_data = push_types[`${user_type}_sent_message`];
    const title = push_data.title;
    const body = push_data.body.replace('[data]', message);

    await publishNotification(user_type, order_id, title, body);
  } catch (err) {
    console.log('notify user err: ', err);
  }
};

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
  const {user_id, user_name, user_type} = req.body;
  const user = await getUser(user_id);

  if (!user) {
    await chatkit.createUser({
      id: user_id,
      name: user_name,
      customData: {
        user_type,
      },
    });
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

app.post('/push/:order_id', async (req, res) => {
  const {data, push_type} = req.body;
  const {order_id} = req.params;

  const user_type = push_type.split('_')[0];

  const push_data = push_types[push_type];
  const title = push_data.title;
  const body = push_data.body.replace('[data]', data);

  await publishNotification(user_type, order_id, title, body);

  return res.send('ok');
});

app.post('/notify', (req, res) => {
  if (verifyRequest(req)) {
    const data = JSON.parse(req.body);
    const type = data.metadata.event_type;
    if (type == 'v1.messages_created') {
      notifyUser(data);
    }
    res.sendStatus(200);
  } else {
    console.log('Unverified request');
    res.sendStatus(401); // unauthorized
  }
});

const PORT = 5000;
app.listen(PORT, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on ports ${PORT}`);
  }
});
