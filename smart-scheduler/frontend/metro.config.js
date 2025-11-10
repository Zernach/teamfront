const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Set Metro server port from environment variable, default to 8081
config.server = {
  ...config.server,
  port: parseInt(process.env.PORT || process.env.RCT_METRO_PORT || '8081', 10),
};

// Ensure tslib resolves correctly for web builds
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Ensure tslib resolves correctly
  if (moduleName === 'tslib') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  // Use default resolution for other modules
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

