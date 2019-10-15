import React, {Component} from 'react';
import {View, Text, Button, Alert, StyleSheet} from 'react-native';

import MapView from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import MapViewDirections from 'react-native-maps-directions';
import Pusher from 'pusher-js/react-native';

import Config from 'react-native-config';

import RNPusherPushNotifications from 'react-native-pusher-push-notifications';
import axios from 'axios';

const CHANNELS_APP_KEY = Config.CHANNELS_APP_KEY;
const CHANNELS_APP_CLUSTER = Config.CHANNELS_APP_CLUSTER;
const BASE_URL = Config.NGROK_HTTPS_URL;

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

import {regionFrom} from '../helpers/location';

import {AppContext} from '../../GlobalContext';

const orderSteps = [
  'Finding a driver',
  'Driver is on the way to pick up your order',
  'Driver has picked up your order and is on the way to deliver it',
  'Driver has delivered your order',
];

RNPusherPushNotifications.setInstanceId(Config.BEAMS_INSTANCE_ID);

const subscribeToRoom = room_id => {
  RNPusherPushNotifications.subscribe(
    room_id,
    (statusCode, response) => {
      console.error(statusCode, response);
    },
    () => {
      console.log('Success');
    },
  );
};

class TrackOrder extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Track Order',
    };
  };

  static contextType = AppContext;

  state = {
    isSearching: true,
    hasDriver: false,
    driverLocation: null,
    orderStatusText: orderSteps[0],
  };

  constructor(props) {
    super(props);

    this.customer_location = this.props.navigation.getParam(
      'customer_location',
    ); // customer's location
    this.restaurant_location = this.props.navigation.getParam(
      'restaurant_location',
    );

    this.customer_address = this.props.navigation.getParam('customer_address');
    this.restaurant_address = this.props.navigation.getParam(
      'restaurant_address',
    );

    this.available_drivers_channel = null; // the pusher channel where all drivers and customers are subscribed to
    this.user_ride_channel = null; // the pusher channel exclusive to the customer and driver in a given ride
    this.pusher = null;
  }

  componentDidMount() {
    this.setState({
      isSearching: true, // show the loader
    });

    this.pusher = new Pusher(CHANNELS_APP_KEY, {
      authEndpoint: `${BASE_URL}/pusher/auth`,
      cluster: CHANNELS_APP_CLUSTER,
      encrypted: true,
    });

    this.available_drivers_channel = this.pusher.subscribe(
      'private-available-drivers',
    );

    this.available_drivers_channel.bind('pusher:subscription_succeeded', () => {
      // make a request to all drivers
      setTimeout(() => {
        this.available_drivers_channel.trigger('client-driver-request', {
          customer: {username: this.context.user_id},
          restaurant_location: this.restaurant_location,
          customer_location: this.customer_location,
          restaurant_address: this.restaurant_address,
          customer_address: this.customer_address,
        });
      }, 2000);
    });

    this.user_ride_channel = this.pusher.subscribe(
      'private-ride-' + this.context.user_id,
    );

    this.user_ride_channel.bind('client-driver-response', data => {
      // customer responds to driver's response
      const {hasDriver} = this.state;
      this.user_ride_channel.trigger('client-driver-response', {
        response: hasDriver ? 'no' : 'yes',
        room_id: hasDriver ? '0' : this.context.room_id,
        room_name: hasDriver ? '' : this.context.room_name,
      });

      if (!hasDriver) {
        setTimeout(async () => {
          const res = await axios.post(
            `${BASE_URL}/push/${this.context.room_id}`,
            {
              push_type: 'customer_confirmed',
              data: this.context.user_name,
            },
          );
        }, 5000);
      }
    });

    this.user_ride_channel.bind('client-found-driver', data => {
      // found driver, the customer has no say about this.
      const driverLocation = regionFrom(
        data.location.latitude,
        data.location.longitude,
        data.location.accuracy,
      );

      this.setState({
        hasDriver: true,
        isSearching: false,
        driverLocation,
      });

      Alert.alert(
        'Driver found',
        "We found you a driver. They're on their way to pick up your order.",
      );
    });

    this.user_ride_channel.bind('client-driver-location', data => {
      // driver location received
      let driverLocation = regionFrom(
        data.latitude,
        data.longitude,
        data.accuracy,
      );

      this.setState({
        driverLocation,
      });
    });

    this.user_ride_channel.bind('client-order-update', data => {
      this.setState({
        orderStatusText: orderSteps[data.step],
      });
    });

    subscribeToRoom(this.context.room_id);

    RNPusherPushNotifications.on('notification', noty => {
      Alert.alert(noty.title, noty.body);
    });
  }

  contactDriver = () => {
    this.props.navigation.navigate('ContactDriver');
  };

  render() {
    const {driverLocation, orderStatusText} = this.state;

    return (
      <View style={styles.wrapper}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{orderStatusText}</Text>

          <Button
            onPress={() => this.contactDriver()}
            title="Contact driver"
            color="#c53c3c"
          />
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            zoomControlEnabled={true}
            initialRegion={this.customer_location}>
            <MapView.Marker
              coordinate={{
                latitude: this.customer_location.latitude,
                longitude: this.customer_location.longitude,
              }}
              title={'Your location'}
            />

            {driverLocation && (
              <MapView.Marker
                coordinate={driverLocation}
                title={'Driver location'}
                pinColor={'#6f42c1'}
              />
            )}

            <MapView.Marker
              coordinate={{
                latitude: this.restaurant_location[0],
                longitude: this.restaurant_location[1],
              }}
              title={'Restaurant location'}
              pinColor={'#4CDB00'}
            />

            {driverLocation && (
              <MapViewDirections
                origin={driverLocation}
                destination={{
                  latitude: this.restaurant_location[0],
                  longitude: this.restaurant_location[1],
                }}
                apikey={GOOGLE_API_KEY}
                strokeWidth={3}
                strokeColor="hotpink"
              />
            )}

            <MapViewDirections
              origin={{
                latitude: this.restaurant_location[0],
                longitude: this.restaurant_location[1],
              }}
              destination={{
                latitude: this.customer_location.latitude,
                longitude: this.customer_location.longitude,
              }}
              apikey={GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="#1b77fb"
            />
          </MapView>
        </View>
      </View>
    );
  }
}
//

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  infoText: {
    marginBottom: 10,
  },
  mapContainer: {
    flex: 9,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TrackOrder;
