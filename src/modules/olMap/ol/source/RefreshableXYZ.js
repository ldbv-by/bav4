/**
 * @module modules/olMap/ol/source/RefreshableXYZ
 */
import { XYZ } from 'ol/source';

/**
 * `XYZ` source that can refresh its tiles "smoothly".
 */
export class RefreshableXYZ extends XYZ {
	/**
	 * @param {ol.Options} [options] XYZ options.
	 */
	constructor(options) {
		super(options);
	}
	/**
	 *
	 * Smoothly updates the tiles by calling the protected method `setKey`.
	 * Note: calling `changed` does nothing and calling `refresh` prunes the cache which is visually not smooth
	 * (see also https://gis.stackexchange.com/questions/302532/how-to-update-tile-source-url-at-zoom-change).
	 *
	 * @param {*} key
	 */
	smoothRefresh(key) {
		super.setKey(key);
	}
}
