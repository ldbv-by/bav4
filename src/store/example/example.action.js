/**
 * Action creators to change/update network state.
 * @module network/action
 */
import { EXAMPLE_COORDINATES_CHANGED, LINKLIST_CHANGED } from './example.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


/**
  * Updates the link list.
  * @function
  * @param {LinkList} linklist
  */
export const setLinkList = (linklist) => {
	getStore().dispatch({
		type: LINKLIST_CHANGED,
		payload: linklist
	});
};


/**
  * Updates the link list.
  * @function
  * @param {Coordinates} coordinates
  */
export const setCoordinates = (coordinates) => {
	// console.log('🚀 ~ file: example.action.js ~ line 33 ~ setCoordinates ~ coordinates', coordinates);
	getStore().dispatch({
		type: EXAMPLE_COORDINATES_CHANGED,
		payload: coordinates
	});
};



