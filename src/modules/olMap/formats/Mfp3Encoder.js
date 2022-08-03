
import Point from 'ol/geom/Point';
import { intersects as extentIntersects } from 'ol/extent';
import { $injector } from '../../../injection';
import { GeoResourceTypes } from '../../../domain/geoResources';

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

		const { MapService: mapService, GeoResourceService: geoResourceService } = $injector.inject('MapService', 'GeoResourceService');
		const mapProjection = `EPSG:${mapService.getSrid()}`;
		const mfpProjection = `EPSG:${mapService.getDefaultGeodeticSrid()}`;
		const mapResolution = olMap.getView().getResolution();

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
		const createEncodingCandidate = (layer) => {
			const layerId = layer.get('id');
			const geoResource = geoResourceService.byId(layerId);

			return { layer: layer, geoResource: geoResource };
		};
		const encodingCandidates = olMap.getLayers().getArray().map(l => createEncodingCandidate(l));
		const candidatesInExtent = encodingCandidates.filter(candidate => extentIntersects(candidate.layer.getExtent(), mapExtent));
		// todo: check wheter or not filter for resolution is needed
		const mfpLayers = candidatesInExtent.map(l => Mfp3Encoder._encodeLayer(l, mapExtent));

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
			}
		};
	}

	static _encodeLayer(olLayer, mapExtent) {

		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const encodeByGeoResourceType = (l) => {
			const layerId = l.get('id');
			const geoResource = geoResourceService.byId(layerId);
			switch (geoResource.getType()) {
				case GeoResourceTypes.AGGREGATE:
					return Mfp3Encoder._encodeGroup(l, mapExtent);
				case GeoResourceTypes.VECTOR:
					return Mfp3Encoder._encodeVector(olLayer, mapExtent);
				case GeoResourceTypes.WMTS:
					return Mfp3Encoder._encodeWMTS(olLayer, mapExtent);
				case GeoResourceTypes.WMS:
					return Mfp3Encoder._encodeWMS(olLayer, mapExtent);
				default:
					return null;
			}
		};
		return encodeByGeoResourceType(olLayer);
	}

	static _encodeGroup(olGroupLayer, mapExtent) {
		return olGroupLayer.getLayers().getArray().map(l => Mfp3Encoder._encodeLayer(l, mapExtent));
	}

	static _encodeWMTS(olWMTSLayer, mapExtent) {
		const source = olWMTSLayer.getSource();
		const tileGrid = source.getTileGrid();
		const extent = olWMTSLayer.getExtent();
		const requestEncoding = source.getRequestEncoding() || 'REST';
		const url = source.getUrls()[0];
		const baseUrl = requestEncoding === 'REST' ? Mfp3Encoder._encodeBaseURL(url) : url.replace(/^\/\//, 'https://');

		const wmtsDimensions = Mfp3Encoder._encodeDimensions(source.getDimensions());
		const matrices = Mfp3Encoder._encodeMatrixIds(tileGrid, extent ? extent : mapExtent);
		return {
			opacity: olWMTSLayer.getOpacity(),
			type: 'WMTS',
			layer: source.getLayer(),
			baseURL: baseUrl,
			matrixIds: matrices,
			version: source.getVersion() || '1.0.0',
			requestEncoding: requestEncoding,
			formatSuffix: source.getFormat().replace('image/', ''),
			style: source.getStyle() || 'default',
			dimensions: Object.keys(wmtsDimensions),
			params: wmtsDimensions,
			matrixSet: source.getMatrixSet() // todo: possible default MatrixSet?
		};
	}

	static _encodeWMS(olWMSLayer, mapExtent) {

		const source = olWMSLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS.split(',') || [];
		const styles = (params.STYLES != null) ?
			params.STYLES.split(',') :
			new Array(layers.length).join(',').split(',');

		const url = (source.getUrls && source.getUrls()[0]) ||
			(source.getUrl && source.getUrl());

		const customParams = params.TIME ? { 'TIME': params.TIME } : {};

		return {
			opacity: olWMSLayer.getOpacity(),
			layer: olWMSLayer.get('id'),
			type: 'WMS',
			baseURL: url.replace(/^\/\//, 'https://'),
			layers: layers,
			styles: styles,
			format: 'image/png', // todo: possible suggestedFormat for GeoResource available?
			customParams: customParams,
			singleTile: false // todo: possible singleTile property for GeoResource available?
		};
	}

	static _encodeVector(olVectorLayer, mapExtent) {
		console.log('encode WMSLayer', olVectorLayer);
	}

	static _encodeBaseURL(url) {
		return url.
			replace(/\{Time\}/i, '{TIME}').
			replace(/\{/g, '%7B').
			replace(/\}/g, '%7D');
	}


	static _encodeDimensions(dimensions) {
		return Object.fromEntries(Object.entries(dimensions).map(([key, value]) => [key.toUpperCase(), value]));
	}

	static encodeMatrixIds(tileGrid, extent) {

		const ids = tileGrid.getMatrixIds();
		const resolutions = tileGrid.getResolutions();


		const matrixIds = Object.entries(resolutions).map((key, value) => {
			const resolution = parseFloat(value);
			const z = tileGrid.getZForResolution(resolution);
			const tileSize = tileGrid.getTileSize(z);
			const topLeftCorner = tileGrid.getOrigin(z);
			const minX = topLeftCorner[0];
			const maxY = topLeftCorner[1];
			const maxX = extent[2];
			const minY = extent[1];
			const topLeftTile = tileGrid.
				getTileCoordForCoordAndZ([minX, maxY], z);
			const bottomRightTile = tileGrid.
				getTileCoordForCoordAndZ([maxX, minY], z);
			const tileWidth = 1 + bottomRightTile[1] - topLeftTile[1];
			const tileHeight = 1 + topLeftTile[2] - bottomRightTile[2];

			return {
				identifier: ids[key],
				resolution: resolution,
				topLeftCorner: tileGrid.getOrigin(z),
				tileSize: [tileSize, tileSize],
				matrixSize: [tileWidth, tileHeight]
			};

		});
		return matrixIds;
	}
}
