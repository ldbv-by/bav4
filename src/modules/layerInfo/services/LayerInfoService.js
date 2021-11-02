import { loadBvvLayerInfo } from '../../../services/provider/layerInfo.provider';
import { LayerInfo } from './layerInfo';

export class LayerInfoService {

	constructor(provider = loadBvvLayerInfo) {
		this._provider = provider;
	}

	/**
	* Returns the corresponding  {@link LayerInfo} for an id.
	* @public
	* @param {string} geoResourceId Id of the desired {@link LayerInfo}
	* @returns {LayerInfo | null }
	* @throws Will throw an error if the provider result is wrong and pass it to the view.
	*/
	async byId(geoResourceId) {
		try {
			const result = await this._provider(geoResourceId);
			return new LayerInfo(result.content, null);
		}
		catch (e) {
			throw new Error('Could not load layerinfo from provider: ' + e.message);
		}
	}
}
