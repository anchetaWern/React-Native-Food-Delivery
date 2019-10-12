import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

class FoodList extends Component {

  render() {
    return (
      <View style={{flex: 1}}>
        <Text>FoodList</Text>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  headerButtonContainer: {
    marginRight: 10,
  },
  wrapper: {
    flex: 1,
    padding: 10,
  },
  topWrapper: {
    flexDirection: 'row',
  },
  textInputWrapper: {
    flex: 4,
  },
  textInput: {
    height: 35,
    borderColor: '#5d5d5d',
    borderWidth: 1,
  },
  buttonWrapper: {
    flex: 1,
  },
  list: {
    marginTop: 20,
  },
});

export default FoodList;