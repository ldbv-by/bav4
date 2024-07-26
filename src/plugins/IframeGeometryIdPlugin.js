/**
 * @module plugins/IframeGeometryIdPlugin
 */
import { $injector } from '../injection';
import { findAllBySelector, IFRAME_GEOMETRY_REFERENCE_ID } from '../utils/markup';
import { observe } from '../utils/storeUtils';
import { BaPlugin } from './BaPlugin';

/**
 * Checks if a surrounding iframe exists and contains the {@link IFRAME_GEOMETRY_REFERENCE_ID } data attribute.
 * If so, it updates the attribute's value on changes in the fileSaveResult property of the draw slice-of-state.
 * @author taulinger
 */
export class IframeGeometryIdPlugin extends BaPlugin {
	constructor() {
		super();
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
	}

	/**
	 * @override
	 */
	async register(store) {
		if (this._environmentService.isEmbedded()) {
			observe(
				store,
				(state) => state.fileStorage.fileId,
				(fileId) => this._updateAttribute(fileId ?? null)
			);
		}
	}

	_updateAttribute(fileId) {
		this._findIframe()?.setAttribute(IFRAME_GEOMETRY_REFERENCE_ID, fileId ? fileId : '');
	}

	_findIframe() {
		return findAllBySelector(this._getDocument(), `iframe[${IFRAME_GEOMETRY_REFERENCE_ID}]`)[0];
	}

	_getDocument() {
		return this._environmentService.getWindow().parent.document;
	}
}
