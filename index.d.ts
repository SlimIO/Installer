declare namespace Installer {
    interface ExtractOptions {
        downloadFromRemote?: boolean;
        forceMkdir?: boolean;
        token?: string;
        name?: string;
    }

    interface InstallOptions {
        installDependencies?: boolean;
        forceMkdir?: boolean;
        token?: string;
    }

    export function initAgent(location: string, options?: { token: string }): Promise<string>;
    export function runAgent(location: string, silent?: boolean, options?: object): Promise<void>;
    export function installDependencies(cwd?: string, lock?: boolean): NodeJS.ReadableStream;
    export function renameDirFromManifest(dir?: string, fileName?: string): Promise<string>;
    export function extractAgent(dest: string, options?: ExtractOptions): Promise<string>;
    export function installAddon(addonName: string, dest: string, options?: InstallOptions): Promise<string>;

    export namespace CONSTANTS {
        export const BUILT_IN_ADDONS: readonly string[];
    }
}

export = Installer;
export as namespace Installer;
