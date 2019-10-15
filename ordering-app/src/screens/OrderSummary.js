import React, {Component} from 'react';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import MapView from 'react-native-maps';
import RNGooglePlaces from 'react-native-google-places';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import Config from 'react-native-config';

import {AppContext} from '../../GlobalContext';

import getSubTotal from '../helpers/getSubTotal';

import {regionFrom} from '../helpers/location';

const GOOGLE_API_KEY = Config.GOOGLE_API_KEY;

Geocoder.init(GOOGLE_API_KEY);

const random = require('string-random');
import axios from 'axios';

const BASE_URL = Config.NGROK_HTTPS_URL;

class OrderSummary extends Component {
  static navigationOptions = {
    title: 'Order Summary',
  };

  static contextType = AppContext;

  state = {
    customer_address: '',
    customer_location: null,
    restaurant_address: '',
    restaurant_location: null,
  };

  async componentDidMount() {
    let location_permission = await check(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (location_permission === 'denied') {
      location_permission = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
    }

    if (location_permission == 'granted') {
      Geolocation.getCurrentPosition(
        async position => {
          const geocoded_location = await Geocoder.from(
            position.coords.latitude,
            position.coords.longitude,
          );

          let customer_location = regionFrom(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy,
          );

          this.setState({
            customer_address: geocoded_location.results[0].formatted_address,
            customer_location,
          });
        },
        error => {
          console.log(error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    }
  }

  openPlacesSearchModal = async () => {
    try {
      const place = await RNGooglePlaces.openAutocompleteModal();

      const customer_location = regionFrom(
        place.location.latitude,
        place.location.longitude,
        16,
      );

      this.setState({
        customer_address: place.address,
        customer_location,
      });
    } catch (err) {
      console.log('err: ', err);
    }
  };

  renderAddressParts = customer_address => {
    return customer_address.split(',').map((addr_part, index) => {
      return (
        <Text key={index} style={styles.addressText}>
          {addr_part}
        </Text>
      );
    });
  };
  //

  render() {
    const subtotal = getSubTotal(this.context.cart_items);
    const {customer_address, customer_location} = this.state;

    return (
      <View style={styles.wrapper}>
        <View style={styles.addressSummaryContainer}>
          {customer_location && (
            <View style={styles.mapContainer}>
              <MapView style={styles.map} initialRegion={customer_location} />
            </View>
          )}

          <View style={styles.addressContainer}>
            {customer_address != '' &&
              this.renderAddressParts(customer_address)}

            <TouchableOpacity
              onPress={() => {
                this.openPlacesSearchModal();
              }}>
              <View style={styles.linkButtonContainer}>
                <Text style={styles.linkButton}>Change location</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cartItemsContainer}>
          <FlatList
            data={this.context.cart_items}
            renderItem={this.renderCartItem}
            keyExtractor={item => item.id.toString()}
          />
        </View>

        <View style={styles.lowerContainer}>
          <View style={styles.spacerBox} />

          {subtotal > 0 && (
            <View style={styles.paymentSummaryContainer}>
              <View style={styles.endLabelContainer}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceLabel}>Booking fee</Text>
                <Text style={styles.priceLabel}>Total</Text>
              </View>

              <View>
                <Text style={styles.price}>${subtotal}</Text>
                <Text style={styles.price}>$5</Text>
                <Text style={styles.price}>${subtotal + 5}</Text>
              </View>
            </View>
          )}
        </View>

        {subtotal == 0 && (
          <View style={styles.messageBox}>
            <Text style={styles.messageBoxText}>Your cart is empty</Text>
          </View>
        )}

        {subtotal > 0 && (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => this.placeOrder()}
              title="Place Order"
              color="#c53c3c"
            />
          </View>
        )}
      </View>
    );
  }
  //

  placeOrder = async () => {
    const {customer_location, customer_address} = this.state;

    const room_id = random();
    const room_name = `Order ${room_id}`;

    this.context.setRoom(room_id, room_name);

    const {
      address: restaurant_address,
      location: restaurant_location,
    } = this.context.cart_items[0].restaurant;

    try {
      // login chatkit user
      await axios.post(`${BASE_URL}/login`, {
        user_id: this.context.user_id,
        user_name: this.context.user_name,
        user_type: this.context.user_type,
      });

      await axios.post(`${BASE_URL}/room`, {
        room_id,
        room_name: room_name,
        user_id: this.context.user_id,
      });
    } catch (err) {
      console.log('login err: ', err);
    }

    this.props.navigation.navigate('TrackOrder', {
      customer_location,
      restaurant_location,
      customer_address,
      restaurant_address,
    });
  };

  renderCartItem = ({item}) => {
    return (
      <View style={styles.cartItemContainer}>
        <View>
          <Text style={styles.priceLabel}>
            {item.qty}x {item.name}
          </Text>
        </View>
        <View>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </View>
    );
  };
}
//

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  addressSummaryContainer: {
    flex: 2,
    flexDirection: 'row',
  },
  addressContainer: {
    padding: 10,
  },
  mapContainer: {
    width: 125,
    height: 125,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  addressText: {
    fontSize: 16,
  },
  linkButtonContainer: {
    marginTop: 10,
  },
  linkButton: {
    color: '#0366d6',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  cartItemsContainer: {
    flex: 5,
    marginTop: 20,
  },
  lowerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  spacerBox: {
    flex: 2,
  },
  cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  paymentSummaryContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 20,
  },
  endLabelContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  priceLabel: {
    fontSize: 16,
  },
  messageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c90d4',
  },
  messageBoxText: {
    fontSize: 18,
    color: '#fff',
  },
  buttonContainer: {
    flex: 1,
    padding: 20,
  },
});

export default OrderSummary;
