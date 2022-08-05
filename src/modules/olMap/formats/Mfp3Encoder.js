
import Point from 'ol/geom/Point';
import { intersects as extentIntersects } from 'ol/extent';
import { $injector } from '../../../injection';
import { GeoResourceTypes } from '../../../domain/geoResources';
import { LimitedImageWMS } from '../ol/source/LimitedImageWMS';

/**
 * A Container-Object for properties related to a mfp encoding
 * @typedef {Object} EncodingProperties
 * @param {string} layoutId
 * @param {Number} scale
 * @param {Number} dpi
 * @param {Number} rotation
 * @param {Point} [pageCenter]
 * @param {Extent} [pageExtent]
 * @param {Number} [targetSRID]
*/

/***
 * @class
 * @author thiloSchlemmer
 */
export class Mfp3Encoder {
	/*
	TODO:
	- should encode to a target srid (or DefaultGeodeticSRID)
	- should filter layer without support of target srid
		-> WmsGeoResource & WmtsGeoResource needs information about available srids
	- check whether or not filter for resolution is needed
	- attributions: to get 'dataOwner' and 'thirdPartyDataOwner'
	*/

	constructor(encodingProperties) {
		const { MapService: mapService, GeoResourceService: geoResourceService } = $injector.inject('MapService', 'GeoResourceService');
		this._mapService = mapService;
		this._geoResourceService = geoResourceService;
		this._mfpProperties = encodingProperties;
		this._mapProjection = `EPSG:${this._mapService.getSrid()}`;
		this._mfpProjection = this._mfpProperties.targetSRID ? `EPSG:${this._mfpProperties.targetSRID}` : `EPSG:${this._mapService.getDefaultGeodeticSrid()}`;
		this._pageExtent = null;

		const validEncodingProperties = (properties) => {
			return properties.layoutId != null && (properties.scale != null && properties.scale !== 0);
		};

		if (!validEncodingProperties(this._mfpProperties)) {
			throw Error('Invalid or missing EncodingProperties');
		}

	}

	/**
	 *
	 * @param {ol.Map} olMap the map with the content to encode for MapFishPrint3
	 * @returns {Object} the encoded mfp specs
	 */
	encode(olMap) {

		const getDefaultMapCenter = () => {
			return olMap.getView().getCenter();
		};
		const getDefaultMapExtent = () => {
			return olMap.getView().calculateExtent(olMap.getSize());
		};

		const mfpCenter = this._mfpProperties.mapCenter && typeof this._mfpProperties.mapCenter === Point
			? this._mfpProperties.mapCenter.clone().transform(this._mapProjection, this._mfpProjection)
			: getDefaultMapCenter().clone().transform(this._mapProjection, this._mfpProjection);

		this._pageExtent = this._mfpProperties.pageExtent
			? this._mfpProperties.pageExtent
			: getDefaultMapExtent();

		const encodedLayers = olMap.getLayers().getArray()
			.filter(layer => extentIntersects(layer.getExtent(), this._pageExtent))
			.map(l => this._encode(l));

		return {
			layout: this._mfpProperties.layoutId,
			attributes: {
				map: {
					center: mfpCenter,
					scale: this._mfpProperties.scale,
					projection: this._mfpProjection,
					dpi: this._mfpProperties.dpi,
					rotation: this._mfpProperties.rotation,
					layers: encodedLayers
				}
			}
		};
	}

	_geoResourceFrom(layer) {
		const layerId = layer.get('id');
		return this._geoResourceService.byId(layerId);
	}

	_encode(layer) {
		const geoResource = this._geoResourceFrom(layer);
		switch (geoResource.getType()) {
			case GeoResourceTypes.AGGREGATE:
				return this._encodeGroup(layer);
			case GeoResourceTypes.VECTOR:
				return this._encodeVector(layer);
			case GeoResourceTypes.WMTS:
				return this._encodeWMTS(layer);
			case GeoResourceTypes.WMS:
				return this._encodeWMS(layer, geoResource);
			default:
				return null;
		}
	}

	_encodeGroup(groupLayer) {
		const subLayers = groupLayer.layer.getLayers();
		return subLayers.map(l => this._encode(l));
	}

	_encodeWMTS(olLayer) {
		const source = olLayer.getSource();
		const tileGrid = source.getTileGrid();
		const extent = olLayer.getExtent();
		const requestEncoding = source.getRequestEncoding() || 'REST';
		const url = source.getUrls()[0];
		const baseUrl = requestEncoding === 'REST' ? Mfp3Encoder._encodeBaseURL(url) : url;

		const wmtsDimensions = Mfp3Encoder.encodeDimensions(source.getDimensions());
		const matrices = Mfp3Encoder.encodeMatrixIds(tileGrid, extent ? extent : this._pageExtent);
		return {
			opacity: olLayer.getOpacity(),
			type: 'WMTS',
			layer: source.getLayer(),
			baseURL: baseUrl,
			matrices: matrices,
			version: source.getVersion() || '1.0.0',
			requestEncoding: requestEncoding,
			imageFormat: source.getFormat(),
			dimensions: Object.keys(wmtsDimensions),
			dimensionParams: wmtsDimensions,
			matrixSet: this._mfpProjection
		};
	}

	_encodeWMS(olLayer, wmsGeoResource) {
		const format = wmsGeoResource.getFormat();
		const source = olLayer.getSource();
		const isSingleTile = source instanceof LimitedImageWMS;
		const params = source.getParams();
		const layers = params.LAYERS.split(',') || [];
		const styles = (params.STYLES != null) ?
			params.STYLES.split(',') :
			new Array(layers.length).join(',').split(',');

		const url = (source.getUrls && source.getUrls()[0]) ||
			(source.getUrl && source.getUrl());

		return {
			opacity: olLayer.getOpacity(),
			layer: wmsGeoResource.id,
			type: 'WMS',
			baseURL: url,
			layers: layers,
			styles: styles,
			format: `image/${format}`,
			singleTile: isSingleTile
		};
	}

	_encodeVector(olVectorLayer) {
		console.warn('encode WMSLayer currently not supported', olVectorLayer);
		return null;
	}

	_encodeBaseURL(url) {
		return url.
			replace(/\{/g, '%7B').
			replace(/\}/g, '%7D');
	}

	static encodeDimensions(dimensions) {
		// todo: move to utils-module due to the general approach
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
