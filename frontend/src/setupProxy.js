/**
 * CRA custom proxy — forwards ALL /api/* requests (including browser
 * navigations like the Google OAuth callback) to the backend.
 *
 * Unlike the simple "proxy" field in package.json, this file uses
 * http-proxy-middleware directly so browser-navigation requests
 * (Accept: text/html) are also proxied instead of being served index.html.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      followRedirects: false,
      // Rewrite the cookie domain so the browser stores the refresh token
      // cookie for localhost:3000 (the proxy origin) instead of localhost:8000.
      // This ensures Ctrl+R sends the cookie back through the proxy correctly.
      cookieDomainRewrite: "",
    })
  );
};
