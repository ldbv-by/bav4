import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';

/**
 * Just initializes the `AuthService`.
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
			await this.#authService.init();
		}
	}
}
