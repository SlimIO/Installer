"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { rmdir, access } = require("fs").promises;

// Require Internal Dependencies
const { installDependencies } = require("../");

// CONSTANTS
const kInstallDeps = join(__dirname, "fixtures", "installDeps");

beforeAll(async() => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await rmdir(join(kInstallDeps, "node_modules"), { recursive: true });
});

afterAll(async() => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await rmdir(join(kInstallDeps, "node_modules"), { recursive: true });
});

// test("install npm dependencies of fixtures/installDeps", async() => {
//     await installDependencies(kInstallDeps);
//     await access(join(kInstallDeps, "node_modules"));
// });
