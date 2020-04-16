/// <reference types="@types/node" />

import { ChildProcessWithoutNullStreams } from "child_process";

declare namespace Installer {
    type AddonExpr = URL | string;

    interface ExtractOptions {
        downloadFromRemote?: boolean;
        token?: string;
        name?: string;
    }

    interface InstallOptions {
        installDependencies?: boolean;
        searchInRegistry?: boolean;
        token?: string;
    }

    interface InitOptions {
        token?: string;
        name?: string;
        forceClean?: boolean;
    }

    interface ExprResult {
        repoUserOrg: string;
        repoName: string;
        host: null | string;
    }

    export function initAgent(location: string, options?: InitOptions): Promise<string>;
    export function runAgent(location: string, silent?: boolean, options?: object): Promise<ChildProcessWithoutNullStreams>;
    export function installDependencies(cwd?: string, lock?: boolean): Promise<void>;
    export function renameDirFromManifest(dir?: string, fileName?: string): Promise<string>;
    export function extractAgent(dest: string, options?: ExtractOptions): Promise<string>;
    export function installAddon(addonExpr: AddonExpr, dest: string, options?: InstallOptions): Promise<string>;
    export function parseAddonExpr(addonExpr: AddonExpr): ExprResult;
    export function setRegistryURL(url: URL): void;

    export namespace CONSTANTS {
        export const BUILT_IN_ADDONS: readonly string[];
    }
}

export = Installer;
export as namespace Installer;
