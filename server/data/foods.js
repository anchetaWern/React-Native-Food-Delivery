const foods_r = [
  {
    id: 1,
    name: 'Spicy Teriyaki',
    price: 19.25,
    image: 'spicy-teriyaki.jpg',

    restaurant: {
      id: 25,
      name: 'MIZ Japanese Restaurant',
      address: '17 Kampong Bahru Rd, Singapore 169347',
      location: [16.618037, 120.3146543],
    },
  },
  {
    id: 2,
    name: 'Honey Garlic Chicken',
    price: 5.5,
    image: 'honey-garlic-chicken.jpg',
    restaurant_id: 26,

    restaurant: {
      id: 26,
      name: 'Everton Food Place',
      address: '7 Everton Park, Singapore 080007',
      location: [1.2773164, 103.8384773],
    },
  },
  {
    id: 3,
    name: 'La-La White Bee Hoon',
    price: 15.94,
    image: 'white-bee-hoon.jpg',

    restaurant: {
      id: 27,
      name: 'Botany Robertson Quay',
      address: '86, #01-03 Robertson Quay, Singapore 238245',
      location: [1.2900394, 103.8351518],
    },
  },
  {
    id: 4,
    name: 'Sesame Chicken Noodle',
    price: 15.94,
    image: 'sesame-chicken-noodle.jpg',
    restaurant_id: 28,
    restaurant: 'Hai Tien Lo',
    location: [1.292396, 103.8562925],
  },
  {
    id: 5,
    name: 'Fried Mee Sua with Shrimps and Scallop',
    price: 15.94,
    image: 'fried-mee-sua.jpg',

    restaurant: {
      id: 29,
      name: 'Imperial Treasure Super Peking Duck',
      address: '7 Raffles Blvd, Singapore 039595',
      location: [1.3033948, 103.833346],
    },
  },
  {
    id: 6,
    name: 'Pork with Vegetables',
    price: 10.5,
    image: 'pork-with-veggies.jpg',

    restaurant: {
      id: 30,
      name: 'Pek Kio Market & Food Centre',
      address: '41 Cambridge Rd, Singapore 210041',
      location: [1.3161213, 103.8480768],
    },
  },
  {
    id: 7,
    name: 'BBQ Red Pork with Egg Noodles',
    price: 12.9,
    image: 'red-bbq-pork-noodles.jpg',

    restaurant: {
      id: 31,
      name: 'Kim Keat Hokkien Mee',
      address: '92 Lor 4 Toa Payoh, Singapore 310092',
      location: [1.3380931, 103.8490967],
    },
  },
  {
    id: 8,
    name: 'Vietnamese Pho',
    price: 70,
    image: 'vietnamese-pho.jpg',

    restaurant: {
      id: 32,
      name: 'Mrs Pho',
      address: '221 Rangoon Rd, Singapore 218459',
      location: [1.2643737, 103.8201297],
    },
  },
  {
    id: 9,
    name: 'Rice with Roasted Pork',
    price: 20.1,
    image: 'rice-with-roasted-pork.jpg',

    restaurant: {
      id: 34,
      name: 'Seah Im Food Centre',
      address: '2 Seah Im Rd, Singapore 099114',
      location: [1.2664712, 103.8173126],
    },
  },
  {
    id: 10,
    name: 'Tori Karaage',
    price: 30,
    image: 'tori-karaage.jpg',

    restaurant: {
      id: 35,
      name: 'Tatsuya',
      address: '22 Scotts Rd, Goodwood Park Hotel, Singapore 228221',
      location: [1.3084636, 103.8317653],
    },
  },
  {
    id: 11,
    name: 'Salmon Sashimi',
    price: 80,
    image: 'salmon-sashimi.jpg',

    restaurant: {
      id: 35,
      name: 'Tatsuya',
      address: '22 Scotts Rd, Goodwood Park Hotel, Singapore 228221',
      location: [1.3084636, 103.8317653],
    },
  },
  {
    id: 12,
    name: 'Gyoza',
    price: 40.99,
    image: 'gyoza.jpg',

    restaurant: {
      id: 35,
      name: 'Tatsuya',
      address: '22 Scotts Rd, Goodwood Park Hotel, Singapore 228221',
      location: [1.3084636, 103.8317653],
    },
  },
];

module.exports.foods = () => {
  return foods_r;
};
