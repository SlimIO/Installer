"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const downloadGithub = require("@slimio/github");

// CONSTANTS
const kArchiveDir = join(__dirname, "..", "archive");

/**
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main() {
    await downloadGithub("SlimIO.Agent", {
        dest: kArchiveDir,
        extract: false
    });
}
main().catch(console.error);
