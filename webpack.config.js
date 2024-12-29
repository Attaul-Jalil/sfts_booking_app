const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add a rule to handle unresolved dependencies for web
  config.resolve.alias['../Components/AccessibilityInfo/legacySendAccessibilityEvent'] = '@babel/noop';

  return config;
};
