/**
 * @module services/ExportVectorDataService
 */
import { KML, GeoJSON, GPX, WKT } from 'ol/format';
import { SourceTypeName } from '../domain/sourceType';
import { parse } from '../utils/ewkt';
import { $injector } from '../injection';
import { LineString, MultiLineString, Polygon } from 'ol/geom';
import { Feature } from 'ol';

/**
 * Service for exporting vector data
 * @author taulinger
 * @interface ExportVectorDataService
 */

/**
 * Exports the data of a {@link VectorGeoResource} into a
 * String containing the data in the specified {@link SourceType| targetSourceType}
 * @function
 * @name ExportVectorDataService#forGeoResource
 * @param {VectorGeoResource} geoResource
 * @param {SourceType} targetSourceType
 * @returns {String}
 * @throws {Error}
 */

/**
 * Exports the data in the specified {@link SourceType| dataSourceType} into a
 * String containing the data in the specified {@link SourceType| targetSourceType}-Format
 * @function
 * @name ExportVectorDataService#forData
 * @param {String} data
 * @param {SourceType} dataSourceType
 * @param {SourceType} targetSourceType
 * @returns {String}
 * @throws {Error}
 */

/**
 * BVV specific service implementation of a ExportVectorDataService
 * to convert data to a String in KML/GPX/GeoJSON/EWKT-Format
 * @class
 * @author thiloSchlemmer
 * @implements {ExportVectorDataService}
 */
export class OlExportVectorDataService {
	constructor() {
		const { ProjectionService } = $injector.inject('ProjectionService');
		this._projectionService = ProjectionService;
	}
	/**
	 * Exports the data of a {@link VectorGeoResource} into a
	 * String containing the data in the specified {@link SourceType| targetSourceType}
	 * @param {VectorGeoResource} geoResource
	 * @param {SourceType} targetSourceType
	 * @returns {String}
	 * @throws {Error}
	 */
	forGeoResource(geoResource, targetSourceType) {
		return this.forData(geoResource.data, geoResource.sourceType, targetSourceType);
	}

	/**
	 * Exports the data in the specified {@link SourceType| dataSourceType} into a
	 * String containing the data in the specified {@link SourceType| targetSourceType}-Format
	 * @name ExportVectorDataService#forData
	 * @param {String} data
	 * @param {SourceType} dataSourceType
	 * @param {SourceType} targetSourceType
	 * @returns {String}
	 * @throws {Error}
	 */
	forData(data, dataSourceType, targetSourceType) {
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

		switch (sourceType.name) {
			case SourceTypeName.EWKT:
				return this._getEwktWriter(sourceType.srid);
			case SourceTypeName.GPX:
				return this._getGpxWriter();
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
			return wktFormat.readFeatures(ewkt.wkt).map((f) => {
				f.set('srid', ewkt.srid, true);
				return f;
			});
		};
	}

	// todo: refactor to ewkt.js or an ewkt-provider
	_getEwktWriter(srid = 4326) {
		return (features) => {
			const wktFormat = new WKT();
			return features.map((feature) => `SRID=${srid};${wktFormat.writeFeature(feature)}`).join('\n');
		};
	}

	// todo: currently only bav3 features are implemented, future implementations should cover optional behavior like tracks vs. routes
	_getGpxWriter() {
		return (features) => {
			const eventuallyToMultiLineString = (feature) => {
				const geometry = feature.getGeometry();
				if (geometry instanceof Polygon) {
					const coordinates = geometry.getLinearRing(0).getCoordinates();
					return new Feature(new MultiLineString([coordinates]));
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
}
