
import Point from 'ol/geom/Point';
import { intersects as extentIntersects } from 'ol/extent';
import { $injector } from '../../../injection';

/**
 * A Container-Object for properties related to a mfp encoding
 * @typedef {Object} EncodingProperties
 * @param {string} layoutId
 * @param {Number} scale
 * @param {Number} dpi
 * @param {Number} rotation
 * @param {Point} [mapCenter]
 * @param {Extent} [mapExtent]
*/

/***
 * @class
 * @author thiloSchlemmer
 */
export class Mfp3Encoder {

	/**
     *
     * @param {ol.Map} olMap the map with the content to encode for MapFishPrint3
     * @param {EncodingProperties} properties optional settings for the encoding
     * @returns {Object} the encoded mfp specs
     */
	static encode(olMap, encodingProperties) {
		const validEncodingProperties = (properties) => {
			return properties.layoutId != null && (properties.scale != null && properties.scale !== 0);
		};

		if (!validEncodingProperties(encodingProperties)) {
			return null;
		}

		const { MapService: mapService } = $injector.inject('MapService');
		const mapProjection = `EPSG:${mapService.getSrid()}`;
		const mfpProjection = `EPSG:${mapService.getDefaultGeodeticSrid()}`;

		const getDefaultMapCenter = () => {
			return olMap.getView().getCenter();
		};
		const getDefaultMapExtent = () => {
			return olMap.getView().calculateExtent(olMap.getSize());
		};

		const mfpCenter = encodingProperties.mapCenter && typeof encodingProperties.mapCenter === Point
			? encodingProperties.mapCenter.clone().transform(mapProjection, mfpProjection)
			: getDefaultMapCenter().clone().transform(mapProjection, mfpProjection);

		const mapExtent = encodingProperties.mapExtent
			? encodingProperties.mapExtent
			: getDefaultMapExtent();

		const mfpLayout = encodingProperties.layoutId;
		const mfpScale = encodingProperties.scale;
		const mfpDpi = encodingProperties.dpi;
		const mfpRotation = encodingProperties.rotation ? encodingProperties.rotation : 0;

		const layersInExtent = olMap.getLayers().getArray().filter(l => extentIntersects(l.getExtent(), mapExtent));
		const mfpLayers = layersInExtent.map(l => Mfp3Encoder._encodeLayer(l));

		/* todo
        - printRectangleCoordinates: to check, if layer extent intersects with export extent
        - language?
        - layers
        - attributions: to get 'dataOwner' and 'thirdPartyDataOwner'
        */

		return {
			layout: mfpLayout,
			attributes: {
				map: {
					center: mfpCenter,
					scale: mfpScale,
					projection: mfpProjection,
					dpi: mfpDpi,
					rotation: mfpRotation,
					layers: mfpLayers
				}
			} };
	}

	static _encodeLayer(olLayer) {
		return {};
	}

}
