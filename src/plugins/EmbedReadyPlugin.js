/**
 * @module plugins/BeforeUnloadPlugin
 */
import { BaPlugin } from './BaPlugin';
import { $injector } from '../injection';
import { observe } from '../utils/storeUtils';

/**
 * This plugin registers when the application is loaded and ready in an embedded (iFrame) environment
 *
 * @class
 * @author herrmutig
 */
export class EmbedReadyPlugin extends BaPlugin {
	_unsubscribeFn;

	/**
	 * @override
	 */
	async register(store) {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		// loading-container is located at src/embed.html
		const onLayerReadyChanged = () => {
			this._cleanupLoadingContainer();
			this._unsubscribeFn();
			this._unsubscribeFn = null;
		};

		if (environmentService.isEmbeddedAsIframe()) {
			// intentionally used observe instead of observeOnce to make testing a bit easier.
			this._unsubscribeFn = observe(store, (state) => state.layers.ready, onLayerReadyChanged);
		}
	}

	_cleanupLoadingContainer() {
		document.getElementById('loading-container')?.remove();
	}
}
