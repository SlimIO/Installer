"use strict";

// Require Node.js Dependencies
const { promisify } = require("util");
const { createReadStream, promises: { mkdir, rename } } = require("fs");
const { join, sep } = require("path");
const { createGunzip } = require("zlib");
const { spawn } = require("child_process");
const stream = require("stream");

// Require Third-party Dependencies
const downloadGithub = require("@slimio/github");
const tar = require("tar-fs");
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const { hasPackageLock } = require("./src/utils.js");

// CONSTANTS
const AGENT_ARCHIVE = join(__dirname, "archive", "Agent-master.tar.gz");
const AGENT_REMOTE_NAME = "SlimIO.Agent";
const EXEC_SUFFIX = process.platform === "win32";
const BUILT_IN_ADDONS = Object.freeze(["Events", "Socket", "Gate", "Alerting", "Aggregator"]);

// ASYNC
const pipeline = promisify(stream.pipeline);

/**
 * @async
 * @function extractAgent
 * @param {!string} dest
 * @param {object} options
 * @param {boolean} [options.downloadFromRemote=false]
 * @param {boolean} [options.forceMkdir=true]
 * @param {string} [options.token]
 * @param {string} [options.name]
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 */
async function extractAgent(dest, options = {}) {
    if (typeof dest !== "string") {
        throw new TypeError("dest must be a string");
    }
    const { downloadFromRemote = false, forceMkdir = true, token, name } = options;

    if (forceMkdir) {
        await mkdir(dest, { recursive: true });
    }

    let currentName = "";
    if (downloadFromRemote) {
        const config = { dest, extract: true };
        if (typeof token === "string") {
            config.auth = token;
        }
        currentName = await downloadGithub(AGENT_REMOTE_NAME, config);
    }
    else {
        await pipeline(
            createReadStream(AGENT_ARCHIVE),
            createGunzip(),
            tar.extract(dest)
        );
        currentName = join(dest, "Agent-master");
    }

    if (typeof name === "string" && name.trim() !== "") {
        const finalPath = join(dest, name);
        await rename(currentName, finalPath);

        return finalPath;
    }

    return join(dest, currentName);
}

/**
 * @function installDependencies
 * @param {!string} cwd working dir where we need to run the npm install cmd
 * @param {boolean} [lock=false] install with package.lock (npm ci)
 * @returns {NodeJS.ReadableStream}
 */
function installDependencies(cwd = process.cwd(), lock = false) {
    const ci = lock ? ["ci", "--only=production"] : ["install", "--production"];

    return spawn(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, ci, {
        cwd, stdio: "pipe"
    });
}

/**
 * @async
 * @function renameDirFromManifest
 * @description Rename cloned addon repository by retrieving the real name in the SlimIO manifest.
 * @param {!string} dir location of the directory to rename
 * @param {!string} fileName manifest file name
 * @returns {Promise<string>}
 */
async function renameDirFromManifest(dir = process.cwd(), fileName = "slimio.toml") {
    try {
        const { name } = Manifest.open(join(dir, fileName));
        await rename(dir, join(dir, "..", name));

        return name;
    }
    catch (err) {
        const [addonName] = dir.split(sep).pop().split("-");
        await rename(dir, addonName);

        return addonName;
    }
}

/**
 * @async
 * @function installAddon
 * @param {!string} addonName
 * @param {!string} dest
 * @param {object} [options]
 * @param {boolean} [options.installDependencies=true]
 * @param {boolean} [options.forceMkdir=true]
 * @param {string} [options.token]
 * @returns {Promise<string>}
 */
async function installAddon(addonName, dest, options = {}) {
    const { installDependencies: iDep = true, forceMkdir = true, token } = options;
    if (forceMkdir) {
        await mkdir(dest, { recursive: true });
    }

    const config = { dest, extract: true };
    if (typeof token === "string") {
        config.auth = token;
    }
    const dirName = await downloadGithub(`SlimIO.${addonName}`, config);
    const addonDir = await renameDirFromManifest(dirName);

    if (iDep) {
        const absoluteAddonDir = join(dest, addonDir);
        const pkgLock = await hasPackageLock(absoluteAddonDir);

        await new Promise((resolve, reject) => {
            const subProcess = installDependencies(absoluteAddonDir, pkgLock);
            subProcess.once("close", resolve);
            subProcess.once("error", reject);
        });
    }

    return addonDir;
}

module.exports = {
    extractAgent,
    renameDirFromManifest,
    installDependencies,
    installAddon,
    CONSTANTS: Object.freeze({ BUILT_IN_ADDONS })
};
