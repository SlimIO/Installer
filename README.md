# Installer
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Installer/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Installer/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/Installer)
![size](https://img.shields.io/github/languages/code-size/SlimIO/Installer)
![known vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/SlimIO/Installer)
[![Build Status](https://travis-ci.com/SlimIO/Installer.svg?branch=master)](https://travis-ci.com/SlimIO/Installer)

SlimIO Agent and Addons installer. We use this package in:

- the [CLI](https://github.com/SlimIO/CLI) to install and clone the agent and all addons.
- [Tcp-SDK](https://github.com/SlimIO/Tcp-Sdk) for testing the communication with the Socket addon.

This package has been designed to be used by Addons to achieve clean unit-testing (by re-cloning a complete agent).

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

// CONSTANTS
const kAddonsToInstall = ["cpu", "MySQL"];

async function main() {
    const agentDir = process.cwd();

    await Promise.allSettled(
        kAddonsToInstall.map((addonName) => installer.installAddon(addonName, agentDir))
    );
}
main().catch(console.error);
```

## API

<details><summary>initAgent(location: string, options?: InitOptions): Promise< string ></summary>
<br />

This method will extract and install all required (built-in) addons for a SlimIO Agent.
```ts
interface InitOptions {
    token?: string;
    name?: string;
    forceClean?: boolean;
}
```

By default `forceClean` is equal to true (this mean that the code will try to remove any agent on the system!).

</details>

<details><summary>runAgent(location: string, silent?: boolean, options?: object): Promise< NodeJS.ReadStream ></summary>
<br />

Run a given SlimIO Agent in a dedicated Node.js child process. Return the process Read Stream.

</details>

<details><summary>installDependencies(cwd?: string, lock?: boolean): Promise< void ></summary>
<br />

Install the dependencies of a given Node.js project directory (it spawn a Node.js process to run the npm install / npm ci command). This command only install **production** dependencies (devDependencies are ignored).

The current working dir value is `process.cwd()`.

</details>

<details><summary>renameDirFromManifest(dir?: string, fileName?: string): Promise< string ></summary>
<br />

Found the real addon name in the SlimIO manifest file and rename the directory name (because by default the directory name is the one from github which is a bad thing). This method is automatically used in **installAddon**.

By default value of the **fileName** argument is `slimio.toml`. The current working dir value is `process.cwd()`.

</details>

<details><summary>extractAgent(dest: string, options?: ExtractOptions): Promise< string ></summary>
<br />

Download the Agent archive on github (or extract a recent version stored in cache for performance). This method is used by **initAgent**.

```ts
interface ExtractOptions {
    downloadFromRemote?: boolean;
    token?: string;
    name?: string;
}
```

By default **downloadFromRemote** is equal to **true**.

</details>

<details><summary>installAddon(addonExpr: string, dest: string, options?: InstallOptions): Promise< string ></summary>
<br />

Install one Addon at the given destination (which must be a valid SlimIO Agent path).

```ts
interface InstallOptions {
    installDependencies?: boolean;
    searchInRegistry?: boolean;
    token?: string;
}
```

By default the dependencies of the addon will be installed. The **searchInRegistry** default value is **false**.

```js
await installAddon("SlimIO.Socket", "./myAgent");
await installAddon("YourGithubOrg.AddonName", "./myAgent");
await installAddon("Alerting", "./myAgent"); // Same as SlimIO.Alerting
await installAddon("https://github.com/SlimIO/Aggregator", "./myAgent");
```

</details>

<details><summary>parseAddonExpr(addonExpr: URL | string): ExprResult</summary>
<br />

Parse an Addon installation expression. The function try to guess the Organization and the Repository name by itself, if there is no org then it will return **SlimIO** as the default org. The returned payload is described by the following TypeScript interface:

```ts
interface ExprResult {
    repoUserOrg: string;
    repoName: string;
    host: null | string;
}
```

Current supported host are `github.com` and `gitlab.com`.

```js
parseAddonExpr("https://github.com/SlimIO/Socket"); // { repoUserOrg: "SlimIO", repoName: "Socket", host: "github.com" }
parseAddonExpr("Socket"); // { repoUserOrg: "SlimIO", repoName: "Socket", host: null }
parseAddonExpr("Foo/Socket"); // { repoUserOrg: "Foo", repoName: "Socket", host: null }
```

</details>

<details><summary>setRegistryURL(url: URL): void</summary>
<br />

Configure the default registry URL used under the hood by the Registry SDK package.

</details>

### CONSTANTS

The list of builtin addons can be retrieved with the **CONSTANTS** object.
```js
const { CONSTANTS } = require("@slimio/installer");

console.log(CONSTANTS.BUILT_IN_ADDONS);
```

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/github](https://github.com/SlimIO/github)|Minor|Medium|Download and extract github repositories|
|[@slimio/gitlab](https://github.com/SlimIO/gitlab#readme)|Minor|Medium|Download and extract gitlab repositories|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|Low|Read, Write and manage SlimIO manifest|
|[@slimio/registry-sdk]()|Minor|Low|SlimIO Registry SDK|
|[tar-fs](https://github.com/mafintosh/tar-fs)|Minor|High|fs bindings for tar-stream|

## License
MIT
