import { PathParameters } from '../domain/pathParameters';
import { $injector } from '../injection';
import { findAllBySelector, IFRAME_ENCODED_STATE } from '../utils/markup';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Checks if a surrounding iframe exists and contains the {@link IFRAME_ENCODED_STATE } data-attribute.
 * If so, it updates the attributes value on state changes.
 * @author taulinger
 */
export class IframeStatePlugin extends BaPlugin {
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
		if (this._environmentService.isEmbedded()) {
			const update = () => {
				this._updateAttribute();
			};

			observe(store, (state) => state.stateForEncoding.changed, update);
		}
	}

	_updateAttribute() {
		const iframeElement = this._findIframe();
		if (iframeElement) {
			const encodedState = this._shareService.encodeState({}, [PathParameters.EMBED]);
			iframeElement.setAttribute(IFRAME_ENCODED_STATE, encodedState);
		}
	}

	_findIframe() {
		return findAllBySelector(this._getDocument(), `iframe[${IFRAME_ENCODED_STATE}]`)[0];
	}

	_getDocument() {
		return this._environmentService.getWindow().parent.document;
	}
}
