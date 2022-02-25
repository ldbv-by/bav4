

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { SourceType, SourceTypeName, SourceTypeResult, SourceTypeResultStatus } from '../domain/sourceType';
import { MediaType } from '../HttpService';

/**
 * A function that tries to detect the source type for a url
 *
 * @typedef {function(string) : (Promise<SourceTypeResult>)} urlSourceTypeProvider
 */

/**
 * A function that tries to detect the source type for given data
 *
 * @typedef {function(string) : (SourceTypeResult)} dataSourceTypeProvider
 */

/**
 * A function that tries to detect the source by given media type
 *
 * @typedef {function(Source) : (SourceTypeResult)} mediaSourceTypeProvider
 */

/**
 * Uses a BVV endpoint to detect the source type for a url.
 * @function
 * @param {string} url
 * @returns {SourceTypeResult}
 */
export const bvvUrlSourceTypeProvider = async (url) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'sourceType';
	const result = await httpService.get(`${endpointUrl}?url=${encodeURIComponent(url)}`);

	switch (result.status) {
		case 200: {
			const { name, version } = await result.json();

			const sourceTypeNameFor = name => {
				switch (name) {
					case 'KML':
						return SourceTypeName.KML;
					case 'GPX':
						return SourceTypeName.GPX;
					case 'GeoJSON':
						return SourceTypeName.GEOJSON;
				}
			};

			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(sourceTypeNameFor(name), version));
		}
		case 204: {
			return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		}
	}
	return new SourceTypeResult(SourceTypeResultStatus.OTHER);
};

/**
 * Default source type provider for data.
 * Currently only character data are supported.
 * @function
 * @param {string} data
 * @returns {SourceTypeResult}
 */
export const defaultDataSourceTypeProvider = (data) => {
	if (isString(data)) {
		// we check the content in a naive manner
		if (data.includes('<kml') && data.includes('</kml>')) {
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML));
		}
		if (data.includes('<gpx') && data.includes('</gpx>')) {
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX));
		}
		try {
			if (JSON.parse(data).type) {
				return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
			}
		}
		catch {
			return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
		}
	}
	return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
};

/**
 * Default source type provider for a given MediaType.
 * @function
 * @param {string} mediaType
 * @returns {SourceTypeResult}
 */
export const defaultMediaSourceTypeProvider = (mediaType) => {
	switch (mediaType) {
		case MediaType.KML:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.KML));
		case MediaType.GPX:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GPX));
		case MediaType.GeoJSON:
			return new SourceTypeResult(SourceTypeResultStatus.OK, new SourceType(SourceTypeName.GEOJSON));
	}
	return new SourceTypeResult(SourceTypeResultStatus.UNSUPPORTED_TYPE);
};
