import React, {Component} from 'react';
import {YellowBox} from 'react-native';

import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import OrderMap from './src/screens/OrderMap';
import ContactCustomer from './src/screens/ContactCustomer';

YellowBox.ignoreWarnings(['Setting a timer']);

const RootStack = createStackNavigator(
  {
    OrderMap,
    ContactCustomer,
  },
  {
    initialRouteName: 'OrderMap',
  },
);

const AppContainer = createAppContainer(RootStack);

class Router extends Component {
  render() {
    return <AppContainer />;
  }
}

export default Router;
