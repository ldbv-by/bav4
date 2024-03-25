/**
 * @module plugins/AuthPlugin
 */
import { $injector } from '../injection';
import { BaPlugin } from './BaPlugin';

/**
 * Initializes the `AuthService`.
 * As this is the first plugin that calls the backend it throws an error when the backend is not available.
 * @class
 * @author taulinger
 */
export class AuthPlugin extends BaPlugin {
	#environmentService;
	#authService;
	#configService;

	constructor() {
		super();
		const {
			EnvironmentService: environmentService,
			AuthService: authService,
			ConfigService: configService
		} = $injector.inject('EnvironmentService', 'AuthService', 'ConfigService');
		this.#environmentService = environmentService;
		this.#authService = authService;
		this.#configService = configService;
	}

	/**
	 * @override
	 */
	async register() {
		if (!this.#environmentService.isStandalone()) {
			try {
				await this.#authService.init();
			} catch (e) {
				throw new Error(
					`A requested endpoint of the backend is not available. Is the backend running and properly configured (current BACKEND_URL=${this.#configService.getValue('BACKEND_URL')})?`,
					{
						cause: e
					}
				);
			}
		}
	}
}
