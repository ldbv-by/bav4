import { $injector } from '../injection';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * @class
 * @author taulinger
 */
export class HistoryStatePlugin extends BaPlugin {

	/**
	 * @override
	 */
	async register(store) {
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');

		const updateHistory = () => {
			environmentService.getWindow().history.replaceState(null, '', shareService.encodeState());
		};

		observe(store, state => state.position.zoom, updateHistory);
		observe(store, state => state.position.center, updateHistory);
		observe(store, state => state.position.rotation, updateHistory);
		observe(store, state => state.layers.active, updateHistory);
		setTimeout(updateHistory, 0);
	}
}
