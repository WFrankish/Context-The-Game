export interface Loadable {
    readonly isLoaded: boolean;
    readonly loadPromise: Promise<void>;
}