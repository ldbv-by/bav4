/**
 * Action creators to update the current chips
 * @module chips/action
 */
import { CHIPS_CHANGED } from './chips.reducer';
import { $injector } from '../../injection';


const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};


/**
  * Sets the current chips.
  * @param {chipConfigurationArray} array id of the current chips
  * @function
  */
export const setCurrent = (chipConfigurationArray) => {
	getStore().dispatch({
		type: CHIPS_CHANGED,
		payload: chipConfigurationArray
	});
};

