import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

class OrderSummary extends Component {

  render() {
    return (
      <View style={{flex: 1}}>
        <Text>OrderSummary</Text>
      </View>
    );
  }

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