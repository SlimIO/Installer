"use strict";

// Require Node.js Dependencies
const { join, basename } = require("path");
const { rmdir, access } = require("fs").promises;

// Require Third-party Dependencies
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const { extractAgent } = require("../");

// CONSTANTS
const kSampleAgentDir1 = join(__dirname, "fixtures", "agentDir1");
const kSampleAgentDir2 = join(__dirname, "fixtures", "agentDir2");
const kSampleAgentDir3 = join(__dirname, "fixtures", "agentDir3");

afterAll(async() => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await rmdir(kSampleAgentDir1, { recursive: true });
    await rmdir(kSampleAgentDir2, { recursive: true });
    await rmdir(kSampleAgentDir3, { recursive: true });
});


test("extract an agent (with local archived version)", async() => {
    const agentDir = await extractAgent(kSampleAgentDir1, { downloadFromRemote: false });
    await access(kSampleAgentDir1);
    await access(agentDir);

    const { name, type } = Manifest.open(join(agentDir, "slimio.toml"));
    expect(name).toStrictEqual("agent");
    expect(type).toStrictEqual("Service");
});

test("extract an agent (with remote github)", async() => {
    const agentDir = await extractAgent(kSampleAgentDir2, { downloadFromRemote: true });
    await access(kSampleAgentDir2);
    await access(agentDir);

    const { name, type } = Manifest.open(join(agentDir, "slimio.toml"));
    expect(name).toStrictEqual("agent");
    expect(type).toStrictEqual("Service");
});

test("extract an agent and rename it", async() => {
    const agentDir = await extractAgent(kSampleAgentDir3, {
        downloadFromRemote: false,
        name: "foobar"
    });
    await access(agentDir);

    expect(basename(agentDir)).toStrictEqual("foobar");
});
