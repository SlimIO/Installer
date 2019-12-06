# Installer
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Installer/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Installer/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/Installer)
![size](https://img.shields.io/github/languages/code-size/SlimIO/Installer)
![known vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/SlimIO/Installer)

SlimIO Agent and Addons installer utilities.

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/installer
# or
$ yarn add @slimio/installer
```

## Usage example

Clone a SlimIO agent (what we do for example in the [Tcp-Sdk](https://github.com/SlimIO/Tcp-Sdk) test suite).
```js
const installer = require("@slimio/installer");
const treekill = require("tree-kill");

async function main() {
    const agentDir = process.cwd();
    await installer.initAgent(agentDir, { name: "agent" });

    // Start the SlimIO Agent his child process
    const cp = await installer.runAgent(agentDir, true);

    try {
        // Do your work here...
    }
    finally {
        treekill(cp.pid);
    }
}
main().catch(console.error);
```

Or install SlimIO Addons in a valid SlimIO Agent directory.
```js
const installer = require("@slimio/installer");

async function main() {
    const toInstall = ["cpu", "MySQL"];
    const agentDir = process.cwd();

    for (const addonName of toInstall) {
        await installer.installAddon(addonName, agentDir, {
            forceMkdir: false
        });
    }
}
main().catch(console.error);
```

## API

<details><summary>initAgent(location: string, options?: InitOptions): Promise< string ></summary>
<br />

This method will extract and install all required (built-in) addons for a SlimIO Agent.

</details>

<details><summary>runAgent(location: string, silent?: boolean, options?: object): Promise< NodeJS.ReadStream ></summary>
<br />

Run a given SlimIO Agent in a dedicated child process.

</details>

<details><summary>installDependencies(cwd?: string, lock?: boolean): NodeJS.ReadableStream</summary>
<br />

Install the dependencies of a given Node.js project directory (it spawn a Node.js process to run npm install).

</details>

<details><summary>renameDirFromManifest(dir?: string, fileName?: string): Promise< string ></summary>
<br />

Found the real addon name in the SlimIO manifest file and rename the directory name (because by default the directory name is the one from github which is a bad thing). This method is automatically used in **installAddon**.

</details>

<details><summary>extractAgent(dest: string, options?: ExtractOptions): Promise< string ></summary>
<br />

Download the Agent archive on github (or extract a recent version stored in cache for performance). This method is used by **initAgent**.

</details>

<details><summary>installAddon(addonName: string, dest: string, options?: InstallOptions): Promise< string ></summary>
<br />

Install one Addon at the given destination (which must be a valid SlimIO Agent path).

</details>

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/github](https://github.com/SlimIO/github)|Minor|Medium|Download and extract github repositories|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|High|TBC|
|[tar-fs](https://github.com/mafintosh/tar-fs)|Minor|High|TBC|

## License
MIT
