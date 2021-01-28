
import { AggregateGeoResource, VectorGeoResource, VectorSourceType, WmsGeoResource, WMTSGeoResource } from './domain/geoResources';

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

	async init() {
		await this.all();
	}

	/**
	 * Returns all available {@link GeoResource}.
	 * @public
	 * @async
	 * @returns  {Array.<GeoResource>}
	 */
	async all() {
		if (!this._georesources) {
			const wms0 = new WmsGeoResource('bodendenkmal', 'Bodendenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bodendenkmalO', 'image/png');
			const wms1 = new WmsGeoResource('baudenkmal', 'Baudenkmal', 'https://geoservices.bayern.de/wms/v1/ogc_denkmal.cgi', 'bauensembleO,einzeldenkmalO', 'image/png');
			const wms2 = new WmsGeoResource('dop80', 'DOP 80 Farbe', 'https://geoservices.bayern.de/wms/v2/ogc_dop80_oa.cgi?', 'by_dop80c', 'image/png');
			const wmts0 = new WMTSGeoResource('atkis_sw', 'Webkarte s/w', 'https://intergeo{31-37}.bayernwolke.de/betty/g_atkisgray/{z}/{x}/{y}');
			const vector0 = new VectorGeoResource('huetten', 'Hütten', 'http://www.geodaten.bayern.de/ba-data/Themen/kml/huetten.kml', VectorSourceType.KML);
			const aggregate0 = new AggregateGeoResource('aggregate0', 'Aggregate', [wmts0, wms0]);

			this._georesources = [wms0, wms1, wms2, wmts0, vector0, aggregate0];

		}
		return this._georesources;
	}


	/**
	 * Returns the corresponding  {@link GeoResource} for an id.
	 * @public
	 * @param {string} id Id of the desired {@link GeoResource}
	 * @returns {Array.<GeoResource> | null}
	 */
	byId(id) {
		if (!this._georesources) {
			throw new Error('GeoResourceService not yet initialized');
		}
		const geoResource = this._georesources.find(georesource => georesource.id === id);
		return geoResource || null;
	}
}