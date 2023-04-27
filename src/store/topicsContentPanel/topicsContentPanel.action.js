/**
 * @module store/topicsContentPanel/topicsContentPanel_action
 */
import { INDEX_CHANGED } from './topicsContentPanel.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 *  Sets the index of an content element that should be active / displayed.
 * @param {TopicsContentPanelIndex} index
 * @function
 */
export const setIndex = (index) => {
	getStore().dispatch({
		type: INDEX_CHANGED,
		payload: index
	});
};
