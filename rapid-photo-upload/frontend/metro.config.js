const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Set Metro server port from environment variable, default to 8083
config.server = {
  ...config.server,
  port: parseInt(process.env.PORT || process.env.RCT_METRO_PORT || '8083', 10),
};

module.exports = config;

