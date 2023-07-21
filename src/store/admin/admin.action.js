import { SELECTED_TOPIC_CHANGED } from './admin.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Updates selected topicId.
 * @function
 * @param {string} currentTopicId
 */
export const setCurrentTopicId = (currentTopicId) => {
	getStore().dispatch({
		type: SELECTED_TOPIC_CHANGED,
		payload: currentTopicId
	});
};
