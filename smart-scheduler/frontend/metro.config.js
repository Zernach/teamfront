const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Set Metro server port from environment variable, default to 8081
config.server = {
  ...config.server,
  port: parseInt(process.env.PORT || process.env.RCT_METRO_PORT || '8081', 10),
};

module.exports = config;

