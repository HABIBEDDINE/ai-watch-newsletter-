/**
 * CRA custom proxy — forwards ALL /api/* requests (including browser
 * navigations like the Google OAuth callback) to the backend.
 *
 * Unlike the simple "proxy" field in package.json, this file uses
 * http-proxy-middleware directly so browser-navigation requests
 * (Accept: text/html) are also proxied instead of being served index.html.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const proxyOptions = {
  target: 'http://localhost:8000',
  changeOrigin: true,
  followRedirects: false,
  cookieDomainRewrite: "",
};

module.exports = function (app) {
  app.use('/api',    createProxyMiddleware(proxyOptions));
  app.use('/health', createProxyMiddleware(proxyOptions));
};
