const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app
    .use(
      '/api',
      createProxyMiddleware({
        target: 'https://gcp-ceramic-testnet-dev.s3.xyz',
        changeOrigin: true,
      })
    )
    .use(
      '/streams',
      createProxyMiddleware({
        target: 'https://api-dev.s3.xyz/',
        changeOrigin: true,
      })
    )
    .use(
      '/models',
      createProxyMiddleware({
        target: 'https://api-dev.s3.xyz/',
        changeOrigin: true,
      })
    )
    .use(
      '/testnet',
      createProxyMiddleware({
        target: 'https://api-dev.s3.xyz/',
        changeOrigin: true,
      })
    )
    .use(
      '/MAINNET',
      createProxyMiddleware({
        target: 'https://api-dev.s3.xyz/',
        changeOrigin: true,
      })
    )
  // .use(
  //   "/model",
  //   createProxyMiddleware({
  //     target: "https://gcp-ceramic-testnet-dev.s3.xyz",
  //     changeOrigin: true,
  //   })
  // );
}
