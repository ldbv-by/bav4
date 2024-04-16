/**
 * @module plugins/EncodeStatePlugin
 */
import { QueryParameters } from '../domain/queryParameters';
import { $injector } from '../injection';
import { PublicComponent } from '../modules/public/components/PublicComponent';
import { equals, observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Synchronizes the current state of the app by updating the history of the window or, when embedded as a web component, its attributes
 *
 * @class
 * @author taulinger
 */
export class EncodeStatePlugin extends BaPlugin {
	constructor() {
		super();
		const { EnvironmentService: environmentService, ShareService: shareService } = $injector.inject('EnvironmentService', 'ShareService');
		this._environmentService = environmentService;
		this._shareService = shareService;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (!this._environmentService.isEmbedded()) {
			const updateHistory = () => {
				this._updateHistory();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateHistory);
		} else if (this._environmentService.isEmbeddedAsWC()) {
			const updateWcAttributes = () => {
				this._updateWcAttributes();
			};

			observe(store, (state) => state.stateForEncoding.changed, updateWcAttributes);
		}
	}

	_updateHistory() {
		const encodedState = this._shareService.encodeState();
		this._environmentService.getWindow().history.replaceState(null, '', encodedState);
	}
	_updateWcAttributes() {
		const params = new URLSearchParams(new URL(this._shareService.encodeState()).search);

		/**
		 * Remove all attributes that are not included in the encoded state.
		 * They are just initial parameters, which won't be updated and should be removed therefore.
		 */
		const paramsKeys = [...params.keys()];
		this._environmentService
			.getWindow()
			.document.querySelector(PublicComponent.tag)
			.getAttributeNames()
			.filter((k) => Object.values(QueryParameters).includes(k))
			.forEach((k) => {
				if (!paramsKeys.includes(k)) {
					this._environmentService.getWindow().document.querySelector(PublicComponent.tag).removeAttribute(k);
				}
			});

		for (const [key, value] of params) {
			// a MutationsObserver on an attribute will also fire if an attribute was just re-set without any value change, so we detect changes here
			if (!equals(this._environmentService.getWindow().document.querySelector(PublicComponent.tag).getAttribute(key), value)) {
				this._environmentService.getWindow().document.querySelector(PublicComponent.tag).setAttribute(key, value);
			}
		}
	}
}
