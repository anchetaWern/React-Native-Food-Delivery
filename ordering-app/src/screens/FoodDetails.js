import React, {Component} from 'react';
import {View, Button, Alert} from 'react-native';

import NavHeaderRight from '../components/NavHeaderRight';
import PageCard from '../components/PageCard';

import {AppContext} from '../../GlobalContext';

class FoodDetails extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('item').name.substr(0, 12) + '...',
      headerRight: (
        <NavHeaderRight toScreen={'OrderSummary'} buttonText={'View Basket'} />
      ),
    };
  };

  static contextType = AppContext;

  state = {
    qty: 1,
  };

  //

  constructor(props) {
    super(props);
    const {navigation} = this.props;
    this.item = navigation.getParam('item');
  }

  qtyChanged = value => {
    const nextValue = Number(value);
    this.setState({qty: nextValue});
  };

  addToCart = (item, qty) => {
    const item_id = this.context.cart_items.findIndex(
      el => el.restaurant.id !== item.restaurant.id,
    );
    if (item_id === -1) {
      Alert.alert(
        'Added to basket',
        `${qty} ${item.name} was added to the basket.`,
      );
      this.context.addToCart(item, qty);
    } else {
      Alert.alert(
        'Cannot add to basket',
        'You can only order from one restaurant for each order.',
      );
    }
  };

  render() {
    const {qty} = this.state;
    return (
      <PageCard
        item={this.item}
        qty={qty}
        qtyChanged={this.qtyChanged}
        addToCart={this.addToCart}
      />
    );
  }
}
//

export default FoodDetails;
