import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import * as expoAssetResolver from 'expo-asset/build/resolveAssetSource';

// Polyfill missing asset transformers in case the runtime React Native version
// (Expo Go) does not expose them yet. Some Expo modules expect these helpers.
const assetSource = resolveAssetSource as any;
const ensureFunction = (target: Record<string, any>, key: string) => {
  if (typeof target[key] !== 'function') {
    target[key] = () => {};
  }
};

ensureFunction(assetSource, 'setCustomSourceTransformer');
ensureFunction(assetSource, 'addCustomSourceTransformer');
ensureFunction(expoAssetResolver, 'setCustomSourceTransformer');
ensureFunction(expoAssetResolver, 'addCustomSourceTransformer');

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
