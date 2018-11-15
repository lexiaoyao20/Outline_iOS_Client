cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "com.borismus.webintent.WebIntent",
    "file": "plugins/com.borismus.webintent/www/webintent.js",
    "pluginId": "com.borismus.webintent",
    "clobbers": [
      "WebIntent"
    ]
  },
  {
    "id": "cordova-plugin-splashscreen.SplashScreen",
    "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
    "pluginId": "cordova-plugin-splashscreen",
    "clobbers": [
      "navigator.splashscreen"
    ]
  },
  {
    "id": "cordova-plugin-outline.OutlinePlugin",
    "file": "plugins/cordova-plugin-outline/outlinePlugin.js",
    "pluginId": "cordova-plugin-outline",
    "clobbers": [
      "cordova.plugins.outline"
    ]
  },
  {
    "id": "cordova-plugin-device.device",
    "file": "plugins/cordova-plugin-device/www/device.js",
    "pluginId": "cordova-plugin-device",
    "clobbers": [
      "device"
    ]
  },
  {
    "id": "cordova-plugin-statusbar.statusbar",
    "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
    "pluginId": "cordova-plugin-statusbar",
    "clobbers": [
      "window.StatusBar"
    ]
  },
  {
    "id": "com.verso.cordova.clipboard.Clipboard",
    "file": "plugins/com.verso.cordova.clipboard/www/clipboard.js",
    "pluginId": "com.verso.cordova.clipboard",
    "clobbers": [
      "cordova.plugins.clipboard"
    ]
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "com.borismus.webintent": "1.1.0",
  "cordova-plugin-whitelist": "1.3.3",
  "cordova-plugin-splashscreen": "5.0.2",
  "cordova-custom-config": "5.0.2",
  "cordova-plugin-outline": "1.0.0",
  "cordova-plugin-device": "1.1.7",
  "cordova-plugin-statusbar": "2.2.3",
  "com.verso.cordova.clipboard": "0.1.0"
};
// BOTTOM OF METADATA
});