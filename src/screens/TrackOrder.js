import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

class TrackOrder extends Component {

  render() {
    return (
      <View style={{flex: 1}}>
        <Text>TrackOrder</Text>
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