import { VectorSourceType } from '../domain/geoResources';
import { MediaType } from '../HttpService';
/**
 * @module service/provider
 */

/**
 * A function that tries to detect the source type for currently loaded vector data.
 *
 * @typedef {function(string, string) : (VectorSourceType|null)} vectorSourceType
 */


/**
 * Default vectorSourceType provider.
 * @function
 * @param {string} data
 * @param {string} [mediaType]
 * @returns VectorSourceType or `null`
 */
export const detectVectorSourceType = (data, mediaType = null) => {

	switch (mediaType) {
		case MediaType.KML:
			return VectorSourceType.KML;
		case MediaType.GPX:
			return VectorSourceType.GPX;
		case MediaType.GeoJSON:
			return VectorSourceType.GEOJSON;
	}
	// alternatively, we check the content in a naive manner
	if (data.includes('<kml') && data.includes('</kml>')) {
		return VectorSourceType.KML;
	}
	if (data.includes('<gpx') && data.includes('</gpx>')) {
		return VectorSourceType.GPX;
	}
	try {
		if (JSON.parse(data).type) {
			return VectorSourceType.GEOJSON;
		}
	}
	catch {
		return null;
	}
	return null;
};
