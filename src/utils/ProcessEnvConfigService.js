
/**
 * Service for external configuration properties.
 * @class
 * @author aul
 */
export class ProcessEnvConfigService {

	getValue(key) {
		// eslint-disable-next-line no-undef
		if (!process.env) {
			throw 'Env object not present, maybe .env-file is missing';
		}
		// eslint-disable-next-line no-undef
		else if (process.env[key]) {
			// eslint-disable-next-line no-undef
			return process.env[key];
		}
		throw 'No value found for \'' + key + '\'';
	}

	hasKey(key) {
		// eslint-disable-next-line no-undef
		if (process.env) {
			// eslint-disable-next-line no-undef
			return Object.prototype.hasOwnProperty.call(process.env, key);
		}
		return false;
	}
}