"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { copyFile, mkdir, rmdir, access } = require("fs").promises;

// Require Internal Dependencies
const { renameDirFromManifest } = require("../");

// CONSTANTS
const kTmpDir = join(__dirname, "dirToRename");
const kFixtures = join(__dirname, "fixtures");
const kRenameDir = join(__dirname, "foobar");
const kTmpAddonDir = join(__dirname, "cpu-addon");

async function cleanup() {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await rmdir(kTmpDir, { recursive: true });
    await rmdir(kRenameDir, { recursive: true });
    await rmdir(kTmpAddonDir, { recursive: true });
    await rmdir(join(__dirname, "cpu"), { recursive: true });
}

beforeAll(async() => {
    await cleanup();
    await mkdir(kTmpAddonDir, { recursive: true });
    await mkdir(kTmpDir, { recursive: true });
    await copyFile(join(kFixtures, "manifest.toml"), join(kTmpDir, "slimio.toml"));
    await new Promise((resolve) => setTimeout(resolve, 20));
});

afterAll(async() => {
    await cleanup();
});

test("renameDirFromManifest (with a slimio manifest)", async() => {
    expect.assertions(0);
    await renameDirFromManifest(kTmpDir);
    await access(kRenameDir);
});

test("renameDirFromManifest (from directory name)", async() => {
    expect.assertions(0);
    await renameDirFromManifest(kTmpAddonDir);
    await access(join(__dirname, "cpu"));
});
