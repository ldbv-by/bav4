import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';
import { OBSERVED_ATTRIBUTE_CHANGED } from './wcAttribute.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Indicates that an observed attribute of the public web component was changed
 * @param {string} queryParameter the corresponding query parameter of the attribute that was changed
 * @function
 */

export const indicateAttributeChange = (queryParameter) => {
	getStore().dispatch({
		type: OBSERVED_ATTRIBUTE_CHANGED,
		payload: new EventLike(queryParameter)
	});
};
