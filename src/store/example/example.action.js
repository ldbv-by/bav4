/**
 * Action creators to change/update network state.
 * @module network/action
 */
import { LINKLIST_CHANGED } from './example.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
  * Updates the fetching property.
  * @function
  * @param {boolean} fetching
  */
export const setFetching = (fetching) => {
	getStore().dispatch({
		type: LINKLIST_CHANGED,
		payload: fetching
	});
};
