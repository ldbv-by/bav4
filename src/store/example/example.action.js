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



