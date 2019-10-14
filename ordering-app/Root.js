import React, {Component} from 'react';
import {YellowBox} from 'react-native';

import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import FoodList from './src/screens/FoodList';
import FoodDetails from './src/screens/FoodDetails';
import OrderSummary from './src/screens/OrderSummary';
import TrackOrder from './src/screens/TrackOrder';
import ContactDriver from './src/screens/ContactDriver';

YellowBox.ignoreWarnings(['Setting a timer']);

const RootStack = createStackNavigator(
  {
    FoodList,
    FoodDetails,
    OrderSummary,
    TrackOrder,
    ContactDriver,
  },
  {
    initialRouteName: 'FoodList',
  },
);

const AppContainer = createAppContainer(RootStack);

class Router extends Component {
  render() {
    return <AppContainer />;
  }
}

export default Router;
