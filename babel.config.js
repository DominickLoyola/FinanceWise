module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        "moduleName": "@env",
        "path": ".env",
        "allowUndefined": false,
        "blocklist": null,
        "allowlist": null,
        "safe": false,
        "verbose": false
      }
    ]
  ]
};
