import { loadBvvIcons } from './provider/icons.provider';

/**
 * Service for managing icons
 * @author thiloSchlemmer
 */
export class IconsService {

    constructor(provider = loadBvvIcons) {
        this._provider = provider;
        this._icons = null;
    }


    async init() {
        if (!this._icons) {
            try {
                this._icons = await this._provider();
            }
            catch (e) {
                this._icons = [];
                console.error('Icons could not be fetched from backend.', e);
            }
        }
        return this._icons;
    }

    all() {
        if (!this._icons) {
            console.warn('IconsService not yet initialized');
            return [];
        }
        return this._icons;
    }
}
