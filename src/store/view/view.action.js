/**
 * @module store/view/view_action
 */
import { $injector } from '../../injection';
import { VIEW_MODE_CHANGED } from './view.reducer';

const getStore = () => {
	const { StoreService: storeService } = $injector.inject('StoreService');
	return storeService.getStore();
};

/**
 * Sets new ViewMode
 * @param {module:domain/view.ViewMode} viewMode
 * @function
 */
export const setViewMode = (viewMode) => {
	getStore().dispatch({
		type: VIEW_MODE_CHANGED,
		payload: viewMode
	});
};
