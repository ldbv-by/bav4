
import { WmsGeoResource } from './domain/geoResources';

/**
 * Provider for BVV {@link GeoResource}.
 * 
 * @class
 * @author aul
 */
export class BvvGeoResourceService {

	constructor() {
		this._georesources = null;
	}

	/**
	 * Returns all available {@link GeoResource}.
	 * @public
	 * @async
	 * @returns  {Array.<GeoResource>} } 
	 */
	async all() {
		if (!this._georesources) {
			const wms0 = new WmsGeoResource('bodendenkmal', 'Bodendenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bodendenkmalO', 'image/png');
			const wms1 = new WmsGeoResource('baudenkmal', 'Baudenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bauensembleO,einzeldenkmalO', 'image/png');
			const wms2 = new WmsGeoResource('dop80', 'DOP 80 Farbe', 'https://geoservices.bayern.de/wms/v2/ogc_dop80_oa.cgi?', 'by_dop80c', 'image/png');
			this._georesources = [wms0, wms1, wms2];

		}
		return this._georesources;
	}


	/**
	 * 
	 * @public
	 * @async
	 * @param {string| Promise.reject} id Id of the desired {@link GeoResource}
	 */
	async byId(id) {
		const georesources = await this.all();
		const geoResource = georesources.find(georesource => georesource.id === id);
		return geoResource || Promise.reject('No GeoResource for ' + id + ' found');
	}
}