/**
 * @module store/stateForEncoding/stateForEncoding_action
 */
import { STATE_FORE_ENCODING_CHANGED } from './stateForEncoding.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Indicates that the encoding-relevant slices-of-state changed.
 * @function
 */
export const indicateChange = () => {
	getStore().dispatch({
		type: STATE_FORE_ENCODING_CHANGED,
		payload: new EventLike(null)
	});
};
