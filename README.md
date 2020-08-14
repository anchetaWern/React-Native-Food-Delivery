# React-Native-Food-Delivery
A food delivery app built with React Native, Pusher Channels, Chatkit, and Beams.

You can read the tutorial here:

- [Create a food ordering app in React Native - Part 1: Making an order](http://pusher.com/tutorials/food-ordering-app-react-native-part-1)
- [Create a food ordering app in React Native - Part 2: Adding the driver app and chat functionality](http://pusher.com/tutorials/food-ordering-app-react-native-part-2)
- [Create a food ordering app in React Native - Part 3: Adding push notifications](http://pusher.com/tutorials/food-ordering-app-react-native-part-3)

It includes the following features:

- Food ordering
- Real-time location tracking
- One on one chat
- Push notifications

Each branch contains the code on each part of the tutorial:

- `starter` - contains the starting point of the delivery app.
- `food-ordering` - the final output for part 1 of the series. This contains the initial code for the food ordering app.
- `driver-app` - the final output of part 2 of the series. This contains the code for the driver app as well as the code for implementing Chat.
- `push-notifications` - the final output of part 3 of the series. This contains the code for implementing push notifications. 
- `master` - contains the most updated code.

## Prerequisites

- React Native development environment
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)
- [Google Cloud Console account](https://console.cloud.google.com/) - enable [Google Maps](https://developers.google.com/maps/gmp-get-started).
- [Channels app instance](https://pusher.com/channels)
- [Chatkit app instance](https://pusher.com/chatkit)
- [Firebase app instance](https://console.firebase.google.com/) - one for each app (food delivery and driver app).
- [Beams app instance](https://pusher.com/beams) - one for each app.
- [ngrok account](https://ngrok.com/)

## Getting started

1. Clone the repo:

```
git clone https://github.com/anchetaWern/React-Native-Food-Delivery.git
```

2. Create a new React Native app for each project

```
react-native init RNFoodDelivery
react-native init RNFoodDeliveryDriver
```

3. Copy the contents of the `ordering-app` folder in the repo to the `RNFoodDelivery` project. Do the same for the `driver-app` folder and copy its contents over to the `RNFoodDeliveryDriver` project. Then move the `server` folder to your working directory.

4. Install the dependencies for both projects as well as the server:

```
cd RNFoodDelivery
yarn install
```

```
cd RNFoodDeliveryDriver
yarn install
```

```
cd server
yarn install
```

5. Update the `.env` file on both projects with your credentials. Do the same for the `server/.env` file.

6. Link the following packages manually:

- react-native-permissions
- react-native-config
- react-native-google-places

7. Update the `android/app/src/main/AndroidManifest.xml` file with the required permissions and Google API key:

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.rnfooddelivery">
  <uses-permission android:name="android.permission.INTERNET" />

  <!-- add these -->
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  ...
</manifest>
```

```
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR GOOGLE API KEY" />
</application>
```

8. Run the server:

```
cd server
node index.js
```

9. Expose the server using ngrok

```
~/ngrok http 5000
```

10. Run the two apps. The first instance runs the bundler on a different port from the default one. Be sure to set the port (from the dev settings) then disconnect the device before running the second app:

```
cd RNFoodDelivery
react-native start --port=8080
react-native run-android
```

```
cd RNFoodDeliveryDriver
react-native start
react-native run-android
```

## Built with

- [React Native](https://facebook.github.io/react-native/)
- [Channels](https://pusher.com/channels)
- [Chatkit](https://pusher.com/chatkit)
- [Beams](https://pusher.com/beams)
- [React Native Maps](https://github.com/react-native-community/react-native-maps)

## Donation

If this project helped you reduce time to develop, please consider buying me a cup of coffee :)

<a href="https://www.buymeacoffee.com/wernancheta" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
