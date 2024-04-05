/**
 * @module plugins/ObserveStateForEncodingPlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { PublicComponent } from '../modules/public/components/PublicComponent';
import { indicateAttributeChange } from '../store/wcAttribute/wcAttribute.action';
import { BaPlugin } from './BaPlugin';

/**
 * Observes all state-relevant attributes of {@link PublicComponent}.
 * @class
 * @author taulinger
 */
export class ObserveWcAttributesPlugin extends BaPlugin {
	/**
	 * @override
	 */
	async register() {
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');

		if (environmentService.isEmbeddedAsWC()) {
			setTimeout(() => {
				const config = { attributes: true, childList: false, subtree: false };
				const observer = new MutationObserver((mutationList) => this._updateWcStore(mutationList));
				observer.observe(document.querySelector(PublicComponent.tag), config);
			});
		}
	}

	_updateWcStore(mutationList) {
		for (const mutation of mutationList) {
			if (mutation.type === 'attributes' && Object.values(QueryParameters).includes(mutation.attributeName)) {
				indicateAttributeChange(mutation.attributeName);
			}
		}
	}
}
