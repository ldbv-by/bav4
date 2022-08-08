
import Point from 'ol/geom/Point';
import { intersects as extentIntersects } from 'ol/extent';
import { GeoJSON as GeoJSONFormat } from 'ol/format';
import { $injector } from '../../../injection';
import { GeoResourceTypes } from '../../../domain/geoResources';

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
		-> WmsGeoResource
	- should translate baseURL of WmtsGeoResource (XYZSource) to a valid baseURL for target srid
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
		this._geometryEncodingFormat = new GeoJSONFormat();

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
			return new Point(olMap.getView().getCenter());
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
			.filter(layer => {
				const layerExtent = layer.getExtent();

				return layerExtent ? extentIntersects(layer.getExtent(), this._pageExtent) : true;
			})
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
		const geoResourceId = layer.get('geoResourceId');
		const geoResource = geoResourceId ? this._geoResourceService.byId(geoResourceId) : this._geoResourceService.byId(layerId);
		if (!geoResource) {
			const idSegments = layerId.split('_');
			const geoResourceIdCandidate = idSegments[0];
			return this._geoResourceService.byId(geoResourceIdCandidate);
		}

		return geoResource;
	}

	_encode(layer) {
		const geoResource = this._geoResourceFrom(layer);
		if (!geoResource) {
			console.warn('No geoResource found for Layer', layer);
			return null;
		}
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
		const subLayers = groupLayer.getLayers().getArray();
		return subLayers.map(l => this._encode(l));
	}

	_encodeWMTS(olLayer) {
		// all WMTS-Layers rely on {@see XYZSource}, this must be translated to spec type 'osm' in MapFishPrint V3
		// the only required parameter is: baseURL
		const source = olLayer.getSource();
		const tileGrid = source.getTileGrid();
		const url = source.getUrls()[0];
		const baseUrl = url;

		return {
			opacity: olLayer.getOpacity(),
			type: 'osm',
			baseURL: baseUrl,
			tileSize: [tileGrid.getTileSize(0), tileGrid.getTileSize(0)]
		};
	}

	_encodeWMS(olLayer, wmsGeoResource) {
		const source = olLayer.getSource();
		const params = source.getParams();
		const layers = params.LAYERS.split(',') || [];
		const styles = (params.STYLES != null) ?
			params.STYLES.split(',') :
			new Array(layers.length).join(',').split(',');

		const url = (source.getUrls && source.getUrls()[0]) ||
			(source.getUrl && source.getUrl());

		return {
			type: 'wms',
			baseURL: url,
			imageFormat: wmsGeoResource.format,
			layers: layers,
			name: wmsGeoResource.id,
			opacity: olLayer.getOpacity(),
			styles: styles
		};
	}

	_encodeVector(olVectorLayer) {
		// todo: refactor to utils
		// adopted/adapted from {@link https://dmitripavlutin.com/javascript-array-group/#:~:text=must%20be%20inserted.-,array.,provided%20by%20core%2Djs%20library. | Array Grouping in JavaScript}
		const groupBy = (elementsToGroup, groupByFunction) => elementsToGroup.reduce((group, element) => {
			const groupName = groupByFunction(element);
			group[groupName] = group[groupName] ?? [];
			group[groupName].push(element);
			return group;
		}, {});

		const defaultGroups = { MultiPolygon: [], Polygon: [], Circle: [], GeometryCollection: [], LineString: [], MultiLineString: [], Point: [] };
		const groupByGeometryType = (features) => groupBy(features, feature => feature.getGeometry().getType());
		const groupedByGeometryType = { ...defaultGroups, ...groupByGeometryType(olVectorLayer.getSource().getFeatures()) };

		const featuresSortedByGeometryType = [
			...groupedByGeometryType['MultiPolygon'],
			...groupedByGeometryType['Polygon'],
			...groupedByGeometryType['Circle'],
			...groupedByGeometryType['GeometryCollection'],
			...groupedByGeometryType['LineString'],
			...groupedByGeometryType['MultiLineString'],
			...groupedByGeometryType['Point']];

		const encodingResults = featuresSortedByGeometryType.reduce((encoded, feature) => {
			const result = this._encodeFeature(feature);
			return {
				features: [...encoded.features, result.feature],
				styles: [...encoded.styles, result.style]
			};
		}, { features: [], styles: [] });

		return {
			type: 'geojson',
			geoJson: { features: encodingResults.features, type: 'FeatureCollection' },
			style: encodingResults.styles,
			opacity: olVectorLayer.getOpacity()
		};
	}

	_encodeFeature(feature) {
		return {
			feature: this._geometryEncodingFormat.writeFeatureObject(feature),
			style: {}
		};
	}
}
