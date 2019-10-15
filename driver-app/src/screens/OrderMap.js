import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

import MapView from 'react-native-maps';
import Pusher from 'pusher-js/react-native';

import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';
import Config from 'react-native-config';

import MapViewDirections from 'react-native-maps-directions';
import axios from 'axios';
import RNPusherPushNotifications from 'react-native-pusher-push-notifications';

import {regionFrom} from '../helpers/location';

const CHANNELS_APP_KEY = Config.CHANNELS_APP_KEY;
const CHANNELS_APP_CLUSTER = Config.CHANNELS_APP_CLUSTER;
const BASE_URL = Config.NGROK_HTTPS_URL;

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

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

const triggerNotification = async (room_id, push_type, data) => {
  try {
    await axios.post(`${BASE_URL}/push/${room_id}`, {
      push_type,
      data,
    });
  } catch (err) {
    console.log('error triggering notification: ', err);
  }
};

class OrderMap extends Component {
  static navigationOptions = ({navigation}) => {
    const showHeaderButton = navigation.getParam('showHeaderButton');
    return {
      title: 'Order Map',
      headerRight: showHeaderButton ? (
        <View style={styles.navHeaderRight}>
          <Button
            onPress={navigation.getParam('headerButtonAction')}
            title={navigation.getParam('headerButtonLabel')}
            color="#e19400"
          />
        </View>
      ) : null,
    };
  };

  state = {
    locationPermission: 'undetermined',
    isOrderDetailsModalVisible: false,
    customer: null, // customer info
    currentLocation: null, // driver's current location
    hasOrder: false, // whether the driver is currently handling an order or not
    restaurantAddress: '',
    customerAddress: '',
  };

  constructor(props) {
    super(props);

    this.user_id = 'johndoe';
    this.user_name = 'John Doe';
    this.user_type = 'driver';

    this.available_drivers_channel = null; // this is where customer will send a request to any available driver

    this.ride_channel = null; // the channel used for communicating the current location
    // for a specific order. Channel name is the customer's username

    this.pusher = null; // the pusher client
  }

  async componentDidMount() {
    this.props.navigation.setParams({
      headerButtonLabel: 'Picked Order',
      headerButtonAction: this._pickedOrder,
    });

    this.pusher = new Pusher(CHANNELS_APP_KEY, {
      authEndpoint: `${BASE_URL}/pusher/auth`,
      cluster: CHANNELS_APP_CLUSTER,
      encrypted: true,
    });

    this.available_drivers_channel = this.pusher.subscribe(
      'private-available-drivers',
    ); // subscribe to "available-drivers" channel

    this.available_drivers_channel.bind('pusher:subscription_succeeded', () => {
      this.available_drivers_channel.bind(
        'client-driver-request',
        order_data => {
          if (!this.state.hasOrder) {
            // if the driver has currently no order
            this.setState({
              isOrderDetailsModalVisible: true,
              customer: order_data.customer,
              restaurantLocation: {
                latitude: order_data.restaurant_location[0],
                longitude: order_data.restaurant_location[1],
              },
              customerLocation: order_data.customer_location,

              restaurantAddress: order_data.restaurant_address,
              customerAddress: order_data.customer_address,
            });
          }
        },
      );
    });

    let location_permission = await check(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (location_permission === 'denied') {
      location_permission = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
    }

    if (location_permission === 'granted') {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude, accuracy} = position.coords;
          const initialRegion = regionFrom(latitude, longitude, accuracy);

          this.setState({
            initialRegion,
          });
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );

      this.watch_location_id = Geolocation.watchPosition(
        position => {
          this.setState({
            currentLocation: position.coords,
          });

          if (this.state.hasOrder) {
            this.ride_channel.trigger('client-driver-location', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
          }
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true},
      );
    }

    this.setState({
      locationPermission: location_permission,
    });

    RNPusherPushNotifications.on('notification', noty => {
      Alert.alert(noty.title, noty.body);
    });

    try {
      await axios.post(`${BASE_URL}/login`, {
        user_id: this.user_id,
        user_name: this.user_name,
        user_type: this.user_type,
      });
    } catch (err) {
      console.log('error creating user: ', err);
    }
  }


  render() {
    const {
      isOrderDetailsModalVisible,
      restaurantAddress,
      customerAddress,

      currentLocation, // driver's current location
      restaurantLocation,
      customerLocation,
      initialRegion,
    } = this.state;

    return (
      <View style={styles.wrapper}>
        <MapView initialRegion={initialRegion} style={styles.map}>
          {currentLocation && (
            <MapView.Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title={"You're here"}
            />
          )}

          {currentLocation && restaurantLocation && (
            <MapViewDirections
              origin={currentLocation}
              destination={restaurantLocation}
              apikey={GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="hotpink"
            />
          )}

          {restaurantLocation && customerLocation && (
            <MapViewDirections
              origin={restaurantLocation}
              destination={customerLocation}
              apikey={GOOGLE_API_KEY}
              strokeWidth={3}
              strokeColor="#1b77fb"
            />
          )}

          {restaurantLocation && (
            <MapView.Marker
              coordinate={{
                latitude: restaurantLocation.latitude,
                longitude: restaurantLocation.longitude,
              }}
              title={'Restaurant is here'}
              pinColor={'#4CDB00'}
            />
          )}

          {customerLocation && (
            <MapView.Marker
              coordinate={{
                latitude: customerLocation.latitude,
                longitude: customerLocation.longitude,
              }}
              title={'Your customer is here'}
              pinColor={'#6f42c1'}
            />
          )}
        </MapView>

        <View style={styles.floatingButtonContainer}>
          <Button
            onPress={this._contactCustomer}
            title={'Contact customer'}
            color="#c53c3c"
          />
        </View>

        <Modal isVisible={isOrderDetailsModalVisible}>
          {restaurantAddress && (
            <View style={styles.modal}>
              <TouchableOpacity onPress={this._hideOrderDetailsModal}>
                <Text style={styles.close}>Close</Text>
              </TouchableOpacity>
              <View style={styles.modalBody}>
                <View style={styles.addressContainer}>
                  <Text style={styles.labelText}>Pick up</Text>
                  <Text style={styles.valueText}>
                    {restaurantAddress.replace(',', '\n')}
                  </Text>
                </View>

                <View style={styles.addressContainer}>
                  <Text style={styles.labelText}>Drop off</Text>
                  <Text style={styles.valueText}>
                    {customerAddress.replace(',', '\n')}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    onPress={this._acceptOrder}
                    title={'Accept order'}
                    color="#28a745"
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button
                    onPress={this._declineOrder}
                    title={'Decline order'}
                    color="#c53c3c"
                  />
                </View>
              </View>
            </View>
          )}
        </Modal>
      </View>
    );
  }
  //

  _pickedOrder = async () => {
    this.props.navigation.setParams({
      headerButtonLabel: 'Delivered Order',
      headerButtonAction: this._deliveredOrder,
    });

    this.ride_channel.trigger('client-order-update', {
      step: 2,
    });

    try {
      await axios.post(`${BASE_URL}/room`, {
        room_id: this.room_id,
        room_name: this.room_name,
        user_id: this.user_id,
      });
    } catch (room_err) {
      console.log('room error: ', room_err);
    }

    await triggerNotification(
      this.room_id,
      'driver_picked_order',
      this.username,
    );
  };

  _deliveredOrder = async () => {
    this.ride_channel.unbind('client-driver-response');
    this.pusher.unsubscribe('private-ride-' + this.state.customer.username);

    this.setState({
      hasOrder: false,

      customer: null,
      restaurantLocation: null,
      customerLocation: null,

      restaurantAddress: null,
      customerAddress: null,
    });

    this.ride_channel.trigger('client-order-update', {
      step: 3,
    });

    await triggerNotification(
      this.room_id,
      'driver_delivered_order',
      this.user_name,
    );
  };

  _contactCustomer = () => {
    this.props.navigation.navigate('ContactCustomer', {
      user_id: this.user_id,
      room_id: this.room_id,
    });
  };

  _acceptOrder = () => {
    const {customer, currentLocation} = this.state;

    this.setState({
      isOrderDetailsModalVisible: false,
    });

    this.ride_channel = this.pusher.subscribe(
      'private-ride-' + customer.username,
    );

    this.ride_channel.bind('pusher:subscription_succeeded', () => {
      // send a handshake event to the customer
      this.ride_channel.trigger('client-driver-response', {
        response: 'yes', // yes, I'm available
      });

      // listen for the acknowledgement from the customer
      this.ride_channel.bind(
        'client-driver-response',
        async customer_response => {
          if (customer_response.response == 'yes') {
            this.setState({
              hasOrder: true,
            });

            this.props.navigation.setParams({
              showHeaderButton: true,
            });

            const {room_id, room_name} = customer_response;

            this.room_id = room_id; // chat room ID
            this.room_name = room_name;

            subscribeToRoom(room_id);

            await triggerNotification(
              room_id,
              'driver_accepted_order',
              this.username,
            );

            this.ride_channel.trigger('client-found-driver', {
              driver: {
                name: this.user_name,
              },
              location: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                accuracy: currentLocation.accuracy,
              },
            });

            setTimeout(() => {
              this.ride_channel.trigger('client-order-update', {
                step: 1,
              });
            }, 2000);
          } else {
            Alert.alert(
              'Order no longer available',
              'Someone else already took the order. Or the customer cancelled.',
              [
                {
                  text: 'Ok',
                },
              ],
              {cancelable: false},
            );
          }
        },
      );
    });
  };

  _declineOrder = () => {
    // homework: add code for informing the customer that the driver declined
  };

  _hideOrderDetailsModal = () => {
    this.setState({
      isOrderDetailsModalVisible: false,
    });
    // homework: add code for informing the customer that the driver declined
  };

  componentWillUnmount() {
    Geolocation.clearWatch(this.watch_location_id);
  }
}
//

const styles = StyleSheet.create({
  navHeaderRight: {
    marginRight: 10,
  },
  wrapper: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: '2%',
    left: '2%',
    alignSelf: 'flex-end',
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  close: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: '#0366d6',
  },
  modalBody: {
    marginTop: 20,
  },
  addressContainer: {
    marginBottom: 20,
  },
  labelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 10,
  },
});

export default OrderMap;