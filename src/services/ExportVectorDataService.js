import { KML, GeoJSON, GPX, WKT } from 'ol/format';
import { SourceType, SourceTypeName } from '../domain/sourceType';

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
		const sourceType = new SourceType(SourceTypeName.KML);
		return this.forData(geoResource.data, sourceType, targetSourceType);
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
		switch (sourceType.name) {
			default:
				return this._getFormat(sourceType).readFeatures;
		}
	}

	_getWriter(sourceType) {
		const ewktWriter = (features) => {
			const srid = sourceType.srid ?? '4326';
			const wktFormat = new WKT();
			features.map((feature) => `SRID=${srid};${wktFormat.writeFeature(feature)}`).join('\n');
		};
		switch (sourceType.name) {
			case SourceTypeName.EWKT:
				return ewktWriter;
			default:
				return this._getFormat(sourceType).writeFeatures;
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
			case SourceTypeName.EWKT:
				return new WKT();
			default:
				throw Error(`Format-provider for ${sourceType.name} is missing.`);
		}
	}
}
