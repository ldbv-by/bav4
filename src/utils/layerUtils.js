/**
 * @module utils/layerUtils
 */
import { $injector } from '../injection/index';

/**
 * Determines the resulting timestamp of a layer.
 * Requires a registered {@link GeoResourceService} for injection. If it is not available it returns the existing timestamp of the given `Layer`
 * @function
 * @param {module:store/layers/layers_action~Layer} layer
 * @returns the timestamp or null
 */
export const getTimestamp = (layer) => {
	// first check if the GeoResourceService is available
	if ($injector.getScope('GeoResourceService')) {
		const { GeoResourceService: geoResourceService } = $injector.inject('GeoResourceService');

		const geoResource = geoResourceService.byId(layer.geoResourceId);
		return geoResource?.hasTimestamps() ? (layer.timestamp ?? geoResource.timestamps[0]) : null;
	}

	return layer.timestamp;
};
