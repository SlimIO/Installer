"use strict";

// Require Node.js Dependencies
const { access } = require("fs").promises;

/**
 * @namespace utils
 */

/**
 * @async
 * @function hasPackageLock
 * @param {string} [dir]
 * @returns {Promise<boolean>}
 */
async function hasPackageLock(dir = process.cwd()) {
    try {
        await access(join(dir, "package-lock.json"));

        return true;
    }
    catch (err) {
        return false;
    }
}

module.exports = { hasPackageLock };
