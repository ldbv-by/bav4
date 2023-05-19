/**
 * @module services/ExportVectorDataService
 */
import { KML, GeoJSON, GPX, WKT } from 'ol/format';
import { SourceTypeName } from '../domain/sourceType';
import { parse } from '../utils/ewkt';

/**
 * Service for exporting vector data
 * @taulinger
 * @thiloSchlemmer
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
		const features = this._getReader(dataSourceType)(data);
		return this._getWriter(targetSourceType)(features);
	}

	_getReader(sourceType) {
		const ewktReader = (data) => {
			const ewkt = parse(data);
			const wktFormat = new WKT();
			return wktFormat.readFeatures(ewkt.wkt).map((f) => {
				f.set('srid', ewkt.srid, true);
				return f;
			});
		};
		switch (sourceType.name) {
			case SourceTypeName.EWKT:
				return ewktReader;
			default:
				return (data) => {
					const format = this._getFormat(sourceType);
					return format.readFeatures(data);
				};
		}
	}

	_getWriter(sourceType) {
		const ewktWriter = (features) => {
			const srid = sourceType.srid ?? '4326';
			const wktFormat = new WKT();
			return features.map((feature) => `SRID=${srid};${wktFormat.writeFeature(feature)}`).join('\n');
		};
		switch (sourceType.name) {
			case SourceTypeName.EWKT:
				return ewktWriter;
			default:
				return (data) => {
					const format = this._getFormat(sourceType);
					return format.writeFeatures(data);
				};
		}
	}

	_getFormat(sourceType) {
		switch (sourceType.name) {
			case SourceTypeName.KML:
				return new KML();
			case SourceTypeName.GEOJSON:
				return new GeoJSON();
			case SourceTypeName.GPX:
				return new GPX();
			default:
				throw Error(`Format-provider for ${sourceType.name} is missing.`);
		}
	}
}
