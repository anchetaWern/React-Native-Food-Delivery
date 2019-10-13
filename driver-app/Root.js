import React, {Component} from 'react';
import {YellowBox} from 'react-native';

import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import OrderMap from './src/screens/OrderMap';

YellowBox.ignoreWarnings(['Setting a timer']);

const RootStack = createStackNavigator(
  {
    OrderMap
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