import { Loadable } from './loadable';

export class Image implements Loadable {
    readonly path: string;
    readonly data: HTMLImageElement;
    private _isLoaded: boolean;
    readonly loadPromise: Promise<void>;

    constructor(path: string) {
        this.path = path;
        this.data = document.createElement('img');
        this._isLoaded = false;

        this.data.src = path;
        this.loadPromise = new Promise((resolve) => {
            this.data.onload = () => {
                this._isLoaded = true;
                resolve();
            };
        });
    }

    get isLoaded(): boolean {
        return this._isLoaded;
    }
}
