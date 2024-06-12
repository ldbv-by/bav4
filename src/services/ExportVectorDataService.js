/**
 * @module services/ExportVectorDataService
 */

import { Feature } from 'ol';
import { KML, GeoJSON, GPX, WKT } from 'ol/format';
import { Fill, Stroke, Icon, Style } from 'ol/style';
import { Point, LineString, MultiLineString, Polygon, MultiPolygon } from 'ol/geom';
import { SourceTypeName, SourceTypeResultStatus } from '../domain/sourceType';
import { parse } from '../utils/ewkt';
import { $injector } from '../injection';

/**
 * Service for exporting vector data
 * @interface ExportVectorDataService
 */

/**
 * Exports the data of a {@link VectorGeoResource} into a
 * String containing the data in the specified {@link SourceType| targetSourceType}
 * @async
 * @function
 * @name module:services/ExportVectorDataService~ExportVectorDataService#forGeoResource
 * @param {module:domain/geoResources.VectorGeoResource} geoResource
 * @param {module:domain/sourceType.SourceType} targetSourceType
 * @returns {String}
 * @throws {Error}
 */

/**
 * Exports the data into a
 * String containing the data in the specified {@link SourceType| targetSourceType}-Format
 * @function
 * @name module:services/ExportVectorDataService~ExportVectorDataService#forData
 * @param {String} data
 * @param {module:domain/sourceType.SourceType} targetSourceType
 * @returns {String}
 * @throws {Error}
 */

/**
 * BVV specific service implementation of a ExportVectorDataService
 * to convert data to a String in KML/GPX/GeoJSON/EWKT-Format
 * @class
 * @author thiloSchlemmer
 * @implements {module:services/ExportVectorDataService~ExportVectorDataService}
 */
export class OlExportVectorDataService {
	constructor() {
		const { SourceTypeService, ProjectionService } = $injector.inject('SourceTypeService', 'ProjectionService');
		this._sourceTypeService = SourceTypeService;
		this._projectionService = ProjectionService;
	}
	/**
	 * Exports the data of a {@link VectorGeoResource} into a
	 * String containing the data in the specified {@link SourceType| targetSourceType}
	 * @param {module:domain/geoResources.VectorGeoResource} geoResource
	 * @param {module:domain/sourceType.SourceType} targetSourceType
	 * @returns {String}
	 * @throws {Error}
	 */
	forGeoResource(geoResource, targetSourceType) {
		const data = geoResource.data;
		if (data) {
			return this._forData(data, geoResource.sourceType, targetSourceType);
		}
		throw Error(`GeoResource '${geoResource.id}' is empty`);
	}

	/**
	 * Exports the data in the specified {@link SourceType| dataSourceType} into a
	 * String containing the data in the specified {@link SourceType| targetSourceType}-Format
	 * @name ExportVectorDataService#forData
	 * @param {String} data
	 * @param {module:domain/sourceType.SourceType} targetSourceType
	 * @returns {String}
	 * @throws {Error}
	 */
	forData(data, targetSourceType) {
		const sourceTypeResult = this._sourceTypeService.forData(data);
		const dataSourceType = sourceTypeResult.sourceType;

		if (sourceTypeResult.status === SourceTypeResultStatus.OK) {
			return this._forData(data, dataSourceType, targetSourceType);
		}
		throw new Error(`Unexpected SourceTypeResultStatus: ${sourceTypeResult.status}`);
	}

	_forData(data, dataSourceType, targetSourceType) {
		const needConvert = dataSourceType.name !== targetSourceType.name;
		const needTransform = dataSourceType.srid !== targetSourceType.srid;

		if (!needConvert && !needTransform) {
			return data;
		}

		const dataFeatures = this._getReader(dataSourceType)(data);
		const targetFeatures = needTransform ? this._transform(dataFeatures, dataSourceType.srid, targetSourceType.srid) : dataFeatures;

		return this._getWriter(targetSourceType)(targetFeatures);
	}

	_getReader(sourceType) {
		const defaultReader = (data) => {
			const format = this._getFormat(sourceType.name);
			return format.readFeatures(data);
		};

		return sourceType.name === SourceTypeName.EWKT ? this._getEwktReader() : defaultReader;
	}

	_getWriter(sourceType) {
		const defaultWriter = (data) => {
			const format = this._getFormat(sourceType.name);
			return format.writeFeatures(data);
		};
		// todo: add custom kmlWriter to assure that every feature without a style can use a defaultStyle.
		switch (sourceType.name) {
			case SourceTypeName.EWKT:
				return this._getEwktWriter(sourceType.srid ?? 4326);
			case SourceTypeName.GPX:
				return this._getGpxWriter();
			case SourceTypeName.KML:
				return this._getKmlWriter();
			default:
				return defaultWriter;
		}
	}

	_getFormat(formatName) {
		switch (formatName) {
			case SourceTypeName.KML:
				return new KML();
			case SourceTypeName.GEOJSON:
				return new GeoJSON();
			case SourceTypeName.GPX:
				return new GPX();
			default:
				throw Error(`Format-provider for ${formatName} is missing.`);
		}
	}

	_transform(features, sourceSrid, targetSrid) {
		if (this._projectionService.getProjections().includes(targetSrid)) {
			return features.map((feature) => {
				const clone = feature.clone();
				clone.setId(feature.getId());
				clone.getGeometry().setProperties(feature.getGeometry().getProperties());
				clone.getGeometry().transform(`EPSG:${sourceSrid}`, `EPSG:${targetSrid}`);

				return clone;
			});
		}
		throw new Error('Unsupported SRID: ' + targetSrid);
	}

	// todo: refactor to ewkt.js or an ewkt-provider
	_getEwktReader() {
		return (data) => {
			const ewkt = parse(data);
			const wktFormat = new WKT();
			if (ewkt) {
				return wktFormat.readFeatures(ewkt.wkt);
			}
			throw Error('Cannot parse data as EWKT');
		};
	}

	// todo: refactor to ewkt.js or an ewkt-provider
	_getEwktWriter(srid) {
		return (features) => {
			const wktFormat = new WKT();
			return `SRID=${srid};${wktFormat.writeFeatures(features)}`;
		};
	}

	// todo: currently only bav3 features are implemented, future implementations should cover optional behavior like tracks vs. routes
	_getGpxWriter() {
		return (features) => {
			const eventuallyToMultiLineString = (feature) => {
				const geometry = feature.getGeometry();
				if (geometry instanceof MultiPolygon) {
					// Naive approach of connecting all outer rings together,
					// assuming that the multipolygon does not consists of disjoined polygons.
					// All other cases are not compatible with gpx spec
					const coordinates = geometry.getPolygons().map((p) => p.getLinearRings().map((r) => r.getCoordinates()));
					return new Feature(new MultiLineString(coordinates));
				}
				if (geometry instanceof Polygon) {
					const coordinates = geometry.getLinearRings().map((r) => r.getCoordinates());
					return new Feature(new MultiLineString(coordinates));
				}
				if (geometry instanceof LineString) {
					const coordinates = geometry.getCoordinates();
					return new Feature(new MultiLineString([coordinates]));
				}
				return feature;
			};

			const gpxFormat = new GPX();
			return gpxFormat.writeFeatures(features.map((feature) => eventuallyToMultiLineString(feature)));
		};
	}

	_getKmlWriter() {
		const { IconService: iconService } = $injector.inject('IconService');
		const format = new KML({ writeStyles: true });
		const defaultStyle = new Style({
			stroke: new Stroke({
				color: [255, 0, 0, 1],
				width: 2
			}),
			fill: new Fill({
				color: [255, 0, 0].concat([0.4])
			})
		});

		const getDefaultIconStyle = () => {
			const symbolSrc = iconService.getIconResult('marker').getUrl('#ff0000');
			return new Style({ image: new Icon({ anchor: [0.5, 0.5], anchorXUnits: 'fraction', anchorYUnits: 'fraction', src: symbolSrc }) });
		};

		const applyDefaultStyle = (feature) => {
			const style = feature.getStyle();
			if (!style) {
				const geometry = feature.getGeometry();
				feature.setStyle(geometry instanceof Point ? getDefaultIconStyle() : defaultStyle);
			}
		};

		return (features) => {
			// set a default style if needed
			features.forEach(applyDefaultStyle);

			return format.writeFeatures(features);
		};
	}
}
