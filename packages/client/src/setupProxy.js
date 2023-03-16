const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app
    .use(
      "/api",
      createProxyMiddleware({
        target: "https://ceramic-private-clay.3boxlabs.com",
        changeOrigin: true,
      })
    )
    .use(
      "/streams",
      createProxyMiddleware({
        target: "https://cscan.onrender.com/",
        changeOrigin: true,
      })
    )
    .use(
      "/models",
      createProxyMiddleware({
        target: "https://cscan.onrender.com/",
        changeOrigin: true,
      })
    )
    .use(
      "/testnet",
      createProxyMiddleware({
        target: "https://cscan.onrender.com/",
        changeOrigin: true,
      })
    )
    .use(
      "/MAINNET",
      createProxyMiddleware({
        target: "https://cscan.onrender.com/",
        changeOrigin: true,
      })
    );
  // .use(
  //   "/model",
  //   createProxyMiddleware({
  //     target: "https://ceramic-private-clay.3boxlabs.com",
  //     changeOrigin: true,
  //   })
  // );
};
