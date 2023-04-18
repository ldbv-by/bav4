import { QUERY_CHANGED } from './search.reducer';
import { $injector } from '../../injection';
import { EventLike } from '../../utils/storeUtils';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Sets the current query.
 * @function
 * @param {string|null} term (will be trimmed)
 */
export const setQuery = (term) => {
	getStore().dispatch({
		type: QUERY_CHANGED,
		payload: new EventLike(term?.trim() ?? null)
	});
};
