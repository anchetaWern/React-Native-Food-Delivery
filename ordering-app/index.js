/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {withAppContextProvider} from './GlobalContext';

AppRegistry.registerComponent(appName, () => withAppContextProvider(App));
