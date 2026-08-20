// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// ============================================
// FIX: Cross-Origin-Opener-Policy warning
// The Google OAuth popup uses window.closed to
// detect when the user finishes signing in.
// Setting COOP to same-origin-allow-popups lets
// the opener page inspect popup state without
// the browser security warning.
// ============================================

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
