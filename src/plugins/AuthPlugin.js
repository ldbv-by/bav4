/**
 * @module plugins/AuthPlugin
 */
import { $injector } from '../injection';
import { removeLayer } from '../store/layers/layers.action';
import { observe } from '../utils/storeUtils';
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
	#geoResourceService;

	constructor() {
		super();
		const {
			EnvironmentService: environmentService,
			AuthService: authService,
			ConfigService: configService,
			GeoResourceService: geoResourceService
		} = $injector.inject('EnvironmentService', 'AuthService', 'ConfigService', 'GeoResourceService');
		this.#environmentService = environmentService;
		this.#authService = authService;
		this.#configService = configService;
		this.#geoResourceService = geoResourceService;
	}

	/**
	 * @override
	 */
	async register(store) {
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

		const onSignOut = (signedIn, state) => {
			if (!signedIn) {
				state.layers.active.forEach((l) => {
					if (!this.#geoResourceService.isAllowed(l.geoResourceId)) {
						removeLayer(l.id);
					}
				});
			}
		};
		observe(store, (state) => state.auth.signedIn, onSignOut);
	}
}
