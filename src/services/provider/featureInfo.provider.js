/**
 * @module service/provider
 */
import { $injector } from '../../injection';
import { FeatureInfoResult } from '../FeatureInfoService';
import { MediaType } from '../HttpService';


/**
  * A function that takes a coordinate and returns a promise with a FeatureInfoResult.
  *
  * @typedef {function(coordinate) : (Promise<FeatureInfoResult>)} featureInfoProvider
  */

/**
  * Uses the BVV service to load a FeatureInfo.
  * @function
  * @param {string} geoResourceId ID of the Georesource
  * @param {Coordinate} coordinate3857 coordinate in 3857
  * @param {number} mapResolution current resolution of the map in meters
  * @returns {FeatureInfoResult} FeatureInfoResult
  */
export const loadBvvFeatureInfo = async (geoResourceId, coordinate3857, mapResolution) => {

	const {
		HttpService: httpService,
		ConfigService: configService
	}
		= $injector.inject('HttpService', 'ConfigService');

	const requestPayload = {
		easting: coordinate3857[0], northing: coordinate3857[1],
		srid: 3857,
		resolution: mapResolution
	};
	const url = configService.getValueAsPath('BACKEND_URL') + `getFeature/${geoResourceId}`;

	const result = await httpService.post(url, JSON.stringify(requestPayload), MediaType.JSON);

	switch (result.status) {
		case 200: {
			const { title, content } = await result.json();
			return new FeatureInfoResult(content, title);
		}
		case 204: {
			return null;
		}
	}
	throw new Error('FeatureInfoResult could not be retrieved');
};
