import { loadBvvLayerInfo } from '../../../services/provider/layerInfo.provider';
import { LayerInfo } from './layerInfo';

export class LayerInfoService {

	constructor(provider = loadBvvLayerInfo) {
		this._provider = provider;
	}

	/**
	* Returns the corresponding  {@link LayerInfo} for an id.
	* @public
	* @param {string} id Id of the desired {@link LayerInfo}
	* @returns {LayerInfo | null }
	*/
	async byId(id) {
		try {
			const result = await this._provider(id);
			return new LayerInfo(result.content, null);
		}
		catch (e) {
			console.warn(e.message);
		}
		return null;
	}
}
