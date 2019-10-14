import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';

import {GiftedChat} from 'react-native-gifted-chat';
import {ChatManager, TokenProvider} from '@pusher/chatkit-client';

import Config from 'react-native-config';

const CHATKIT_INSTANCE_LOCATOR_ID = Config.CHATKIT_INSTANCE_LOCATOR_ID;
const CHATKIT_SECRET_KEY = Config.CHATKIT_SECRET_KEY;
const CHATKIT_TOKEN_PROVIDER_ENDPOINT = Config.CHATKIT_TOKEN_PROVIDER_ENDPOINT;

import {AppContext} from '../../GlobalContext';

class ContactDriver extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Contact Driver'
    };
  };
  //

  static contextType = AppContext;

  state = {
    messages: [],
  };

  async componentDidMount() {
    try {
      const chatManager = new ChatManager({
        instanceLocator: CHATKIT_INSTANCE_LOCATOR_ID,
        userId: this.context.user_id,
        tokenProvider: new TokenProvider({
          url: CHATKIT_TOKEN_PROVIDER_ENDPOINT,
        }),
      });

      let currentUser = await chatManager.connect();
      this.currentUser = currentUser;

      await this.currentUser.subscribeToRoomMultipart({
        roomId: this.context.room_id,
        hooks: {
          onMessage: this._onMessage,
        },
        messageLimit: 30,
      });
    } catch (err) {
      console.log('chatkit error: ', err);
    }
  }

  _onMessage = data => {
    const {message} = this._getMessage(data);

    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message),
    }));
  };

  _getMessage = ({id, sender, parts, createdAt}) => {
    const text = parts.find(part => part.partType === 'inline').payload.content;

    const msg_data = {
      _id: id,
      text: text,
      createdAt: new Date(createdAt),
      user: {
        _id: sender.id.toString(),
        name: sender.name,
        avatar: `https://na.ui-avatars.com/api/?name=${sender.name}`,
      },
    };

    return {
      message: msg_data,
    };
  };

  render() {
    const {messages} = this.state;

    return (
      <View style={styles.wrapper}>
        <GiftedChat
          messages={messages}
          onSend={messages => this._onSend(messages)}
          showUserAvatar={true}
          user={{
            _id: this.context.user_id,
          }}
        />
      </View>
    );
  }

  _onSend = async ([message]) => {
    try {
      await this.currentUser.sendSimpleMessage({
        roomId: this.context.room_id,
        text: message.text,
      });
    } catch (send_msg_err) {
      console.log('error sending message: ', send_msg_err);
    }
  };
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});

export default ContactDriver;