import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppRegistry } from 'react-native';
import { getStorybookUI, configure } from '@storybook/react-native';
import {name as appName} from '../app.json';

import { loadStories } from './storyLoader';
import './rn-addons';

declare let module

// import stories
configure(() => {
  require('./welcomeStory')
  loadStories();
}, module);

export const StorybookUIRoot = getStorybookUI({
    onDeviceUI: true,
    asyncStorage: AsyncStorage,
    resetStorybook: true,
    disableWebsockets: true

})

AppRegistry.registerComponent(appName, () => StorybookUIRoot);
