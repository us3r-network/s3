const webpack = require('webpack')

module.exports = {
  webpack: {
    configure: (config) => {
      // Replace include option for babel loader with exclude
      // so babel will handle workspace projects as well.
      config.module.rules[1].oneOf.forEach((r) => {
        if (r.loader && r.loader.indexOf('babel') !== -1) {
          r.exclude = /node_modules/;
          delete r.include;
        }
      });
      config.resolve.fallback = {
          process: require.resolve('process/browser'),
          zlib: require.resolve('browserify-zlib'),
          stream: require.resolve('stream-browserify'),
          path: require.resolve('path-browserify'),
          crypto: require.resolve('crypto-browserify'),
          util: require.resolve('util'),
          buffer: require.resolve('buffer'),
          asset: require.resolve('assert'),
          url: require.resolve('url/'),
          vm: require.resolve('vm-browserify'),
          os: require.resolve('os-browserify/browser'),
          constants: require.resolve('constants-browserify'),
          console: require.resolve('console-browserify'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
      config.ignoreWarnings = [/Failed to parse source map/];
      return config;
    },
  },
}
