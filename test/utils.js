"use strict";

// Require Node.js Dependencies
const { join } = require("path");

// Require Internal Dependencies
const { hasPackageLock } = require("../src/utils");

// CONSTANTS
const kFixturesDir = join(__dirname, "fixtures");

test("hasPackageLock of 'dirWithLock' must return true", async() => {
    const result = await hasPackageLock(join(kFixturesDir, "dirWithLock"));
    expect(result).toBe(true);
});

test("hasPackageLock of a dir that doesn't exist must return false", async() => {
    const result = await hasPackageLock(join(kFixturesDir, "noDirExist"));
    expect(result).toBe(false);
});

test("hasPackageLock with no argument must check current wording dir (which must return true)", async() => {
    const result = await hasPackageLock();
    expect(result).toBe(true);
});
