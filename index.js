/**
 * Railway fallback: if the platform runs `node index.js` instead of `node server.js`,
 * this file exists and simply loads server.js, so "Cannot find module '/app/index.js'" cannot occur.
 */
import "./server.js";
