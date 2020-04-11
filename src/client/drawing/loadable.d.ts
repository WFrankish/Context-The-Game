export interface Loadable {
    readonly assets: string | string[];
    readonly isLoaded: boolean;
    readonly loadPromise: Promise<void>;
}