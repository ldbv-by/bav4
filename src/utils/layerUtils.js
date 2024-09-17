import { $injector } from '../injection/index';

/**
 * Determines the resulting timestamp of a layer
 * @param {module:store/layers/layers_action~Layer} layer
 * @returns the timestamp or null
 */
export const getTimestamp = (layer) => {
	const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

	const geoResource = geoResourceService.byId(layer.geoResourceId);
	return geoResource?.hasTimestamps() ? (layer.timestamp ?? geoResource.timestamps[0]) : null;
};
