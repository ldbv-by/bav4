/**
 * Action creators to indicate changes of a GeoResource.
 * @module geoResources/action
 */
import { GEORESOURCE_CHANGED } from './geoResources.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { GeoResource } from '../../domain/geoResources';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
  * Announces that one or more properties of a GeoResource were changed.
  * @function
  * @param {GeoResource|string} grOrId GeoResource or its id
  */
export const propertyChanged = (grOrId) => {
	getStore().dispatch({
		type: GEORESOURCE_CHANGED,
		payload: new EventLike(grOrId instanceof GeoResource ? grOrId.id : grOrId)
	});
};
