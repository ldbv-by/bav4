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


	async _load() {
		if (this._icons === null) {
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

	async all() {
		if (this._icons === null) {
			return await this._load();
		}
		return this._icons;
	}
}
