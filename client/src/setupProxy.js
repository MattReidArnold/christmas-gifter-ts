const { createProxyMiddleware } = require('http-proxy-middleware');

const host = process.env.PROXY_HOST || 'localhost';
const port = process.env.PROXY_PORT || '4000';

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://${host}:${port}`,
      changeOrigin: true,
    })
  );
};
