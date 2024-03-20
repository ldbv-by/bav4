/**
 * @module plugins/AuthPlugin
 */
import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';

/**
 * Initializes the `AuthService`.
 * As it is the first plugin that calls the backend it throws an error when the backend is not available.
 * @class
 * @author taulinger
 */
export class AuthPlugin extends BaPlugin {
	#environmentService;
	#authService;

	constructor() {
		super();
		const { EnvironmentService: environmentService, AuthService: authService } = $injector.inject('EnvironmentService', 'AuthService');
		this.#environmentService = environmentService;
		this.#authService = authService;
	}

	/**
	 * @override
	 */
	async register() {
		if (!this.#environmentService.isStandalone()) {
			try {
				await this.#authService.init();
			} catch (e) {
				throw new Error('Backend is not available. Is the backend running and properly configured?', { cause: e });
			}
		}
	}
}
