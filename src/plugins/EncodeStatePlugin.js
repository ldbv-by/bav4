/**
 * @module plugins/EncodeStatePlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { PublicComponent } from '../modules/public/components/PublicComponent';
import { equals, observe } from '../utils/storeUtils';
import { debounced } from '../utils/timer';
import { BaPlugin } from './BaPlugin';

/**
 * Synchronizes the current state of the app by updating the history of the window or, when embedded as a web component, its attributes
 *
 * @class
 * @author taulinger
 */
export class EncodeStatePlugin extends BaPlugin {
	#environmentService;
	#shareService;
	#debouncedUpdateHistoryFn = debounced(EncodeStatePlugin.DEBOUNCED_DELAY_MS, () => this._updateHistory());
	constructor() {
		super();
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');
		this.#environmentService = environmentService;
		this.#shareService = shareService;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (!this.#environmentService.isEmbedded()) {
			const updateHistory = () => {
				this.#debouncedUpdateHistoryFn();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateHistory);
		} else if (this.#environmentService.isEmbeddedAsWC()) {
			const updateWcAttributes = () => {
				this._updateWcAttributes();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateWcAttributes);
		}
	}

	_updateHistory() {
		// const encodedState = this.#shareService.encodeState();
		// this.#environmentService.getWindow().history.replaceState(null, '', encodedState);
	}
	_updateWcAttributes() {
		const params = this.#shareService.getParameters({ includeHiddenGeoResources: true });

		/**
		 * Remove all attributes that are not included in the encoded state.
		 * They are just initial parameters, which won't be updated and should be removed therefore.
		 */
		const paramsKeys = [...params.keys()];
		this.#environmentService
			.getWindow()
			.document.querySelector(PublicComponent.tag)
			.getAttributeNames()
			.filter((k) => Object.values(QueryParameters).includes(k))
			.forEach((k) => {
				if (!paramsKeys.includes(k)) {
					this.#environmentService.getWindow().document.querySelector(PublicComponent.tag).removeAttribute(k);
				}
			});

		for (const [key, value] of params.entries()) {
			// a MutationsObserver on an attribute will also fire if an attribute was just re-set without any value change, so we detect changes here
			if (!equals(this.#environmentService.getWindow().document.querySelector(PublicComponent.tag).getAttribute(key), value)) {
				this.#environmentService.getWindow().document.querySelector(PublicComponent.tag).setAttribute(key, value);
			}
		}
	}

	static get DEBOUNCED_DELAY_MS() {
		return 200;
	}
}
