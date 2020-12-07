
/**
 * Service for external configuration properties.
 * @class
 * @author aul
 */
export class ProcessEnvConfigService {
	constructor() {
		this._properties = new Map();
		// eslint-disable-next-line no-undef
		this._properties.set('SEARCH_SERVICE_API_KEY', process.env.SEARCH_SERVICE_API_KEY);
	}

	getValue(key) {
		// eslint-disable-next-line no-undef
		if (this.hasKey(key)) {
			// eslint-disable-next-line no-undef
			return this._properties.get(key);
		}
		throw 'No value found for \'' + key + '\'';
	}

	hasKey(key) {
		return !!this._properties.get(key);
	}
}