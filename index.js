"use strict";

// Require Node.js Dependencies
const stream = require("stream");
const { promisify } = require("util");
const { join, sep } = require("path");
const { createGunzip } = require("zlib");
const { execFile } = require("child_process");
const {
    createReadStream,
    promises: { mkdir, rmdir, rename }
} = require("fs");

// Require Third-party Dependencies
const tar = require("tar-fs");
const github = require("@slimio/github");
const Manifest = require("@slimio/manifest");
const registry = require("@slimio/registry-sdk");

// Require Internal Dependencies
const { hasPackageLock } = require("./src/utils.js");

// CONSTANTS
const AGENT_ARCHIVE = join(__dirname, "archive", "Agent-master.tar.gz");
const AGENT_REMOTE_NAME = "SlimIO.Agent";
const EXEC_SUFFIX = process.platform === "win32";
const BUILT_IN_ADDONS = Object.freeze(["Events", "Socket", "Gate", "Alerting", "Aggregator"]);
const DEFAULT_ORG_NAME = "SlimIO";

// ASYNC
const pipeline = promisify(stream.pipeline);
const execFileAsync = promisify(execFile);

/**
 * @async
 * @function initAgent
 * @param {!string} location
 * @param {object} [options]
 * @param {string} [options.token]
 * @param {string} [options.name="agent"]
 * @param {string} [options.forceClean=true]
 * @returns {Promise<string>}
 */
async function initAgent(location, options = Object.create(null)) {
    const { token = null, name = "agent", forceClean = true } = options;
    if (forceClean) {
        await rmdir(join(location, name), { recursive: true });
    }

    const agentDir = await extractAgent(location, { name, token });
    const addonsDir = join(agentDir, "addons");

    await mkdir(addonsDir, { recursive: true });
    await Promise.all([
        installDependencies(agentDir, true),
        ...BUILT_IN_ADDONS.map((addonName) => installAddon(addonName, addonsDir, { token }))
    ]);

    return agentDir;
}

/**
 * @async
 * @function extractAgent
 * @param {!string} dest
 * @param {object} options
 * @param {boolean} [options.downloadFromRemote=false] download from remote github repository (or from a local archive)
 * @param {string} [options.token] github token
 * @param {string} [options.name] repository name (on the local system).
 * @returns {Promise<string>}
 *
 * @throws {TypeError}
 */
async function extractAgent(dest, options = {}) {
    if (typeof dest !== "string") {
        throw new TypeError("dest must be a string");
    }
    const { downloadFromRemote = false, token, name } = options;
    await mkdir(dest, { recursive: true });

    let currentName = "";
    if (downloadFromRemote) {
        const config = { dest, extract: true };
        if (typeof token === "string") {
            config.auth = token;
        }
        currentName = await github(AGENT_REMOTE_NAME, config);
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

    return currentName;
}

/**
 * @async
 * @function runAgent
 * @param {!string} location
 * @param {boolean} [silent=true]
 * @param {object} [options]
 * @returns {Promise<NodeJS.ReadStream>}
 */
async function runAgent(location, silent = true, options = { stdio: "inherit" }) {
    const cpArgs = ["--experimental-modules", join(location, "index.js")];
    if (silent) {
        cpArgs.push("--silent");
    }

    const cp = spawn(process.argv[0], cpArgs, options);
    cp.on("error", (err) => console.error(err));

    // Wait a little bit (else the agent will not be yet started).
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return cp;
}

/**
 * @async
 * @function installDependencies
 * @param {!string} cwd working dir where we need to run the npm install cmd
 * @param {boolean} [lock=false] install with package.lock (npm ci)
 * @returns {Promise<void>}
 */
async function installDependencies(cwd = process.cwd(), lock = false) {
    const cmdArgs = lock ? ["ci", "--only=production"] : ["install", "--production"];

    await execFileAsync(`npm${EXEC_SUFFIX ? ".cmd" : ""}`, cmdArgs, { cwd });
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
    let name;
    try {
        ({ name } = Manifest.open(join(dir, fileName)));
    }
    catch (error) {
        ([name] = dir.split(sep).pop().split("-"));
    }
    const addonName = join(dir, "..", name);
    await rename(dir, addonName);

    return addonName;
}

/**
 * @function parseAddonExpr
 * @param {!string} addonExpr
 * @returns {[string, string]}
 *
 * @throws {Error}
 *
 * @example
 * parseAddonExpr("https://github.com/SlimIO/Socket"); // ["SlimIO", "Socket"]
 * parseAddonExpr("Socket"); // ["SlimIO", "Socket"]
 * parseAddonExpr("Foo/Socket"); // ["Foo", "Socket"]
 */
function parseAddonExpr(addonExpr) {
    try {
        const gitURL = new URL(addonExpr);
        if (gitURL.host !== "github.com") {
            throw new Error("Only github.com is supported as host!");
        }

        return gitURL.pathname.split("/", 3).slice(1);
    }
    catch (error) {
        if (error.code !== "ERR_INVALID_URL") {
            throw error;
        }

        if (addonExpr.indexOf("/") === -1) {
            return [DEFAULT_ORG_NAME, addonExpr];
        }

        return addonExpr.split("/", 2);
    }
}

/**
 * @function setRegistryURL
 * @description set a new SlimIO Registry URL
 * @param {!URL} url WHATWG URL
 * @returns {void}
 *
 * @throws {TypeError}
 */
function setRegistryURL(url) {
    if (!(url instanceof URL)) {
        throw new TypeError("url must be an instanceof WHATWG URL");
    }

    registry.constants.registry_url = url;
}

/**
 * @async
 * @function installAddon
 * @param {!string} addonExpr
 * @param {!string} dest
 * @param {object} [options]
 * @param {boolean} [options.installDependencies=true]
 * @param {boolean} [options.searchInRegistry=false]
 * @param {string} [options.token]
 * @returns {Promise<string>}
 */
async function installAddon(addonExpr, dest, options = {}) {
    const { installDependencies: iDep = true, searchInRegistry = false, token } = options;
    await mkdir(dest, { recursive: true });

    if (searchInRegistry) {
        const addonInfos = await registry.getOneAddon(addonExpr);
        // eslint-disable-next-line no-param-reassign
        addonExpr = addonInfos.git;
    }
    const [repoUserOrg, repoName] = parseAddonExpr(addonExpr);

    const config = Object.assign({ dest, extract: true }, typeof token === "string" ? { auth: token } : {});
    const dirName = await github(`${repoUserOrg}.${repoName}`, config);
    const addonDir = await renameDirFromManifest(dirName);

    if (iDep) {
        const pkgLock = await hasPackageLock(addonDir);

        await installDependencies(addonDir, pkgLock);
    }

    return addonDir;
}

module.exports = {
    initAgent,
    setRegistryURL,
    parseAddonExpr,
    extractAgent,
    runAgent,
    renameDirFromManifest,
    installDependencies,
    installAddon,
    CONSTANTS: Object.freeze({ BUILT_IN_ADDONS })
};
