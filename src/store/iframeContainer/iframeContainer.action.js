import { IFRAME_CONTAINER_CHANGED } from './iframeContainer.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Opens the container.
 * @param {string|TemplateResult} content  The content of the container. Could either be a a plain string or a lit-html TemplateResult.
 * @function
 */
export const openContainer = (content) => {
	getStore().dispatch({
		type: IFRAME_CONTAINER_CHANGED,
		payload: content
	});
};

/**
 * Closes the container.
 * @function
 */
export const closeContainer = () => {
	getStore().dispatch({
		type: IFRAME_CONTAINER_CHANGED,
		payload: null
	});
};
