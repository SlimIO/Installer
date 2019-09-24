"use strict";

const { join } = require("path");
const { extractAgent } = require("./");

/**
 * @function main
 */
async function main() {
    console.time("extract");
    await extractAgent(join(__dirname, "temp"), {
        downloadFromRemote: true,
        name: "agent"
    });
    console.timeEnd("extract");
}
main().catch(console.error);
