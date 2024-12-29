// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Handle .png files as assets
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
  config.resolver.assetExts.push('png');

  // Redirect imports of ReactNativePrivateInterface to a mock file
  config.resolver.extraNodeModules = {
    "react-native/Libraries/ReactPrivate/ReactNativePrivateInterface": path.resolve(__dirname, "mocks/ReactNativePrivateInterface.js"),
  };

  return config;
})();
