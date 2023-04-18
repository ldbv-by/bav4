import { CHIPS_CHANGED } from './chips.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets the current active chips.
 * @param {Array<ChipConfiguration>} array of the current chips
 * @function
 */
export const setCurrent = (chipConfigurationArray) => {
	if (Array.isArray(chipConfigurationArray)) {
		getStore().dispatch({
			type: CHIPS_CHANGED,
			payload: chipConfigurationArray
		});
	}
};
