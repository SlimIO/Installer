declare namespace Installer {
    interface ExtractOptions {
        downloadFromRemote?: boolean;
        forceMkdir?: boolean;
        token?: string;
        name?: string;
    }

    interface InstallOptions {
        installDependencies?: boolean;
        searchInRegistry?: boolean;
        forceMkdir?: boolean;
        token?: string;
    }

    interface InitOptions {
        token?: string;
        name?: string;
        forceClean?: boolean;
    }

    export function initAgent(location: string, options?: InitOptions): Promise<string>;
    export function runAgent(location: string, silent?: boolean, options?: object): Promise<NodeJS.ReadStream>;
    export function installDependencies(cwd?: string, lock?: boolean): NodeJS.ReadableStream;
    export function renameDirFromManifest(dir?: string, fileName?: string): Promise<string>;
    export function extractAgent(dest: string, options?: ExtractOptions): Promise<string>;
    export function installAddon(addonName: string, dest: string, options?: InstallOptions): Promise<string>;
    export function parseAddonExpr(addonExpr: string): [string, string];
    export function setRegistryURL(url: URL): void;

    export namespace CONSTANTS {
        export const BUILT_IN_ADDONS: readonly string[];
    }
}

export = Installer;
export as namespace Installer;
