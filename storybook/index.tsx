import { AppRegistry } from 'react-native';
import { getStorybookUI, configure } from '@storybook/react-native';
import {name as appName} from '../app.json';

import { loadStories } from './storyLoader';
import './rn-addons';

declare let module

// import stories
configure(() => {
  loadStories();
}, module);

export const StorybookUIRoot = getStorybookUI({
    onDeviceUI: true,
    asyncStorage: require("@react-native-async-storage/async-storage").default,
})

AppRegistry.registerComponent(appName, () => StorybookUIRoot);
