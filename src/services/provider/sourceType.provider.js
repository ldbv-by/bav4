

import { $injector } from '../../injection';
import { isString } from '../../utils/checks';
import { MediaType } from '../HttpService';
import { SourceType, SourceTypeName } from '../SourceTypeService';

/**
 * A function that tries to detect the source type for a url
 *
 * @typedef {function(string) : (Promise<SourceType>)} urlSourceTypeProvider
 */

/**
 * A function that tries to detect the source type for a url
 *
 * @typedef {function(string, MediaType) : (SourceType|null)} dataSourceTypeProvider
 */

/**
 * Uses a BVV endpoint to detect the source type for a url.
 * @function
 * @param {string} url
 * @returns {SourceType|null}
 */
export const bvvUrlSourceTypeProvider = async (url) => {

	const { HttpService: httpService, ConfigService: configService } = $injector.inject('HttpService', 'ConfigService');
	const endpointUrl = configService.getValueAsPath('BACKEND_URL') + 'sourceType';
	const result = await httpService.get(`${endpointUrl}?url=${url}`);

	switch (result.status) {
		case 200: {
			const { name, version } = await result.json();
			return new SourceType(name, version);
		}
		case 204: {
			return null;
		}
	}
	throw new Error('SourceType could not be retrieved');
};

/**
 * Default source type provider for data.
 * Currently only character data are supported.
 * @function
 * @param {string} data
 * @param {string} [mediaType]
 * @returns SourceType or `null`
 */
export const defaultDataSourceTypeProvider = (data, mediaType = null) => {
	if (isString(data)) {
		switch (mediaType) {
			case MediaType.KML:
				return new SourceType(SourceTypeName.KML);
			case MediaType.GPX:
				return new SourceType(SourceTypeName.GPX);
			case MediaType.GeoJSON:
				return new SourceType(SourceTypeName.GeoJSON);
		}
		// alternatively, we check the content in a naive manner
		if (data.includes('<kml') && data.includes('</kml>')) {
			return new SourceType(SourceTypeName.KML);
		}
		if (data.includes('<gpx') && data.includes('</gpx>')) {
			return new SourceType(SourceTypeName.GPX);
		}
		try {
			if (JSON.parse(data).type) {
				return new SourceType(SourceTypeName.GeoJSON);
			}
		}
		catch {
			return null;
		}
	}
	return null;
};
