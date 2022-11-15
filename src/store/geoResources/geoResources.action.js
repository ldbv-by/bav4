/**
 * Action creators to indicate changes of a GeoResource.
 * @module geoResources/action
 */
import { GEORESOURCE_CHANGED } from './geoResources.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
  * Announces the change of one or more properties of a GeoResource
  * @function
  * @param {string} id id of the changed GeoResource
  */
export const propertyChanged = (id) => {
	getStore().dispatch({
		type: GEORESOURCE_CHANGED,
		payload: new EventLike(id)
	});
};
