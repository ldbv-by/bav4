import { loadBvvLayerInfo } from '../services/provider/layerInfoResult.provider';

export class LayerInfoService {

	constructor(provider = loadBvvLayerInfo) {
		this._provider = provider;
	}

	/**
	* Returns the corresponding  {@link LayerInfoResult} for an id.
	* @public
	* @param {string} geoResourceId Id of the desired {@link LayerInfoResult}
	* @returns {LayerInfoResult | null }
	* @throws Will throw an error if the provider result is wrong and pass it to the view.
	*/
	async byId(geoResourceId) {
		try {
			return await this._provider(geoResourceId);
		}
		catch (e) {
			throw new Error('Could not load layerinfoResult from provider: ' + e.message);
		}
	}
}

/**
* @class
* @author costa_gi
*/
export class LayerInfoResult {

	/**
	 *
	 * @param {string} content of this LayerInfoResult
	 * @param {string} [title=null] optional title of this LayerInfoResult
	 */
	constructor(content, title = null) {

		this._content = content;
		this._title = title;
	}

	get content() {
		return this._content;
	}

	get title() {
		return this._title;
	}
}

