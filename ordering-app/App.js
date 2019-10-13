import React, {Fragment} from 'react';
import {SafeAreaView, StatusBar, View, StyleSheet} from 'react-native';

import Root from './Root';

const App = () => {
  return (
    <Fragment>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Root />
      </SafeAreaView>
    </Fragment>
  );
};

//

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
