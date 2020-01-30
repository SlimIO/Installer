"use strict";

// Require Node.js Dependencies
const { join } = require("path");
const { rmdir, access, readdir } = require("fs").promises;

// Require Third-party Dependencies
const treekill = require("treekill");
const tcpSDK = require("@slimio/tcp-sdk");

// Require Internal Dependencies
const { initAgent, runAgent, CONSTANTS } = require("../");

// CONSTANTS
const kSampleAgent = join(__dirname, "fixtures", "init_agent");

async function cleanup() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    await rmdir(kSampleAgent, { recursive: true });
}
beforeAll(cleanup);
afterAll(cleanup);

test("init and run an agent", async() => {
    expect.assertions(2);
    const agentDir = await initAgent(kSampleAgent);
    const addonsDir = join(agentDir, "addons");
    await access(agentDir);
    await access(addonsDir);

    const files = await readdir(addonsDir);
    expect(files.length).toStrictEqual(CONSTANTS.BUILT_IN_ADDONS.length);

    const cp = await runAgent(agentDir, true);

    try {
        const client = new tcpSDK();
        await client.once("connect", 1000);

        try {
            const info = await client.sendOne("gate.status");
            expect(info.name).toBe("gate");
        }
        finally {
            client.close();
        }
    }
    finally {
        treekill(cp.pid);
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

});
