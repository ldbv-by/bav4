/**
 * Action creators to update the current topic
 * @module topics/action
 */
import { TOPIC_CHANGED } from './topics.reducer';
import { $injector } from '../../../injection';


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};


/**
  * Sets the current topic.
  * @param {string} id id of the current topic
  * @function
  */
export const setCurrent = (id) => {
	getStore().dispatch({
		type: TOPIC_CHANGED,
		payload: id
	});
};