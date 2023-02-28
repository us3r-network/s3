const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          process: require.resolve("process/browser"),
          zlib: require.resolve("browserify-zlib"),
          stream: require.resolve("stream-browserify"),
          path: require.resolve("path-browserify"),
          crypto: require.resolve("crypto-browserify"),
          util: require.resolve("util"),
          buffer: require.resolve("buffer"),
          asset: require.resolve("assert"),
          url: require.resolve("url/"),
          vm: require.resolve("vm-browserify"),
          os: require.resolve("os-browserify/browser"),
          constants: require.resolve("constants-browserify"),
          console: require.resolve("console-browserify"),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        }),
      ],
      ignoreWarnings: [/Failed to parse source map/],
    },
    // externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
    // externals: [nodeExternals()],
  },
};
