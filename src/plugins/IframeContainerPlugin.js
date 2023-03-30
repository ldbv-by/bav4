import { observe } from '../utils/storeUtils';
import { BaPlugin } from '../plugins/BaPlugin';
import { closeContainer, openContainer } from '../store/iframeContainer/iframeContainer.action';
import { html } from 'lit-html';

/**
 * @class
 * @author taulinger
 */
export class IframeContainerPlugin extends BaPlugin {
	/**
	 * @override
	 * @param {Store} store
	 */
	async register(store) {
		const onFeatureInfoQueryingChanged = (querying, state) => {
			const {
				featureInfo: { current }
			} = state;
			if (!querying) {
				if (current.length === 0) {
					closeContainer();
				} else {
					openContainer(html`<ba-feature-info-iframe-panel></ba-feature-info-iframe-panel>`);
				}
			}
		};

		const onFeatureInfoAbortedChanged = () => {
			closeContainer();
		};

		observe(store, (state) => state.featureInfo.querying, onFeatureInfoQueryingChanged);
		observe(store, (state) => state.featureInfo.aborted, onFeatureInfoAbortedChanged);
	}
}
