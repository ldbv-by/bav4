
/**
 * Service for external configuration properties.
 * @class
 * @author aul
 */
export default class ProcessEnvConfigService {

	getValue(key) {
		// eslint-disable-next-line no-undef
		if (process.env[key]) {
			// eslint-disable-next-line no-undef
			return process.env[key];
		}
		throw 'No value found for \'' + key + '\'';
	}

	hasKey(key) {
		// eslint-disable-next-line no-undef
		return Object.prototype.hasOwnProperty.call(process.env, key);
	}
}