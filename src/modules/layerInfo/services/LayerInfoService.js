import { loadBvvLayerInfo } from '../services/provider/layerInfoResult.provider';
import { $injector } from '../../../injection';

export class LayerInfoService {

	constructor(provider = loadBvvLayerInfo) {
		this._provider = provider;
		const { EnvironmentService: environmentService } = $injector.inject('EnvironmentService');
		this._environmentService = environmentService;
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
			if (this._environmentService.isStandalone()) {
				console.warn('layerinfo could not be fetched from backend. Using fallback layerinfo');
				return this._newFallbackLayerinfo(geoResourceId);
			}
			else {
				throw new Error('Could not load layerinfoResult from provider: ' + e.message);
			}
		}
	}

	/**
	 * @private
	 */
	_newFallbackLayerinfo(geoRessourceId) {
		//see fallback georesources in GeoResourceService
		switch (geoRessourceId) {
			case 'atkis': {
				return new LayerInfoResult('This is a fallback layerinfo', 'atkis');
			}
			case 'atkis_sw': {
				return new LayerInfoResult('This is a fallback layerinfo', 'atkis_sw');
			}
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

