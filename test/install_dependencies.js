"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { existsSync, promises: { rmdir, access } } = require("fs");

// Require Internal Dependencies
const { installDependencies } = require("../");

// CONSTANTS
const kInstallDeps = join(__dirname, "fixtures", "installDeps");
const kInstallDepsNoLock = join(__dirname, "fixtures", "installDepsNoLock");

async function cleanup() {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await rmdir(join(kInstallDeps, "node_modules"), { recursive: true });
    await rmdir(join(kInstallDepsNoLock, "node_modules"), { recursive: true });
}

beforeAll(cleanup);
afterAll(cleanup);

test("install npm dependencies of fixtures/installDeps", async() => {
    await installDependencies(kInstallDeps, true);
    await access(join(kInstallDeps, "node_modules"));
});

test("install npm dependencies of fixtures/kInstallDepsNoLock (with no package.lock)", async() => {
    await installDependencies(kInstallDepsNoLock, false);
    await access(join(kInstallDepsNoLock, "node_modules"));

    // const exist = existsSync(join(kInstallDepsNoLock, "package-lock.json"));
    // expect(exist).toStrictEqual(false);
});
