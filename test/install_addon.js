"use strict";

// Require Node.js Dependencies
const { join, basename } = require("path");
const { existsSync, promises: { rmdir, access } } = require("fs");

// Require Internal Dependencies
const { installAddon } = require("../");

// CONSTANTS
const kFixturesDir = join(__dirname, "fixtures");
const kAddonsDir = join(kFixturesDir, "tmpAddons");

async function cleanup() {
    await new Promise((resolve) => setImmediate(resolve));
    await rmdir(kAddonsDir, { recursive: true });
}
afterAll(cleanup);
beforeAll(cleanup);

test("install Socket addon with no dependencies", async() => {
    const addonDir = await installAddon("Socket", kAddonsDir, { installDependencies: false });

    await access(addonDir);
    await access(join(kAddonsDir, "socket"));
    expect(basename(addonDir)).toStrictEqual("socket");

    const hasNodeModules = existsSync(join(addonDir, "node_modules"));
    expect(hasNodeModules).toBe(false);
});

test("install Alerting addon with dependencies", async() => {
    const addonDir = await installAddon("Alerting", kAddonsDir, { installDependencies: true });

    await access(addonDir);
    await access(join(kAddonsDir, "alerting"));
    expect(basename(addonDir)).toStrictEqual("alerting");

    const hasNodeModules = existsSync(join(addonDir, "node_modules"));
    expect(hasNodeModules).toBe(true);
});
