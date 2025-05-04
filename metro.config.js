const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// Temporary fix for https://github.com/supabase/supabase-js/issues/1400
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, {
  input: './global.css',
});
