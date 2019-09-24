declare namespace AgentPack {
    interface ExtractOptions {
        downloadFromRemote?: boolean;
        forceMkdir?: boolean;
        token?: string;
        name?: string;
    }

    interface InstallOptions {
        installDependencies?: boolean;
        forceMkdir?: boolean;
    }

    export function extractAgent(dest: string, options?: ExtractOptions): Promise<string>;
    export function installAddon(addonName: string, dest: string, options?: any): Promise<void>;

    export namespace CONSTANTS {
        export const BUILT_IN_ADDONS: string[];
    }
}

export = AgentPack;
export as namespace AgentPack;
