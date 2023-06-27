/**
 * @module store/modal/modal_action
 */
import { MODAL_CHANGED, MODAL_NEXT_STEP, MODAL_PREVIOUS_STEP } from './modal.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Options of the modal.
 * @typedef {Object} ModalOptions
 * @property {number} [steps] Number of steps, Default is `1`
 *
 */

/**
 * Opens the modal.
 * @param {string} title The title of the modal
 * @param {string|TemplateResult} content  The content of the modal. Could either be a a plain string or a lit-html TemplateResult.
 * @param {module:store/modal/modal_action~ModalOptions} options
 * @function
 */
export const openModal = (title, content, options = { steps: 1 }) => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: {
			title: title,
			content: content,
			options: options
		}
	});
};

/**
 * Closes the modal.
 * @function
 */
export const closeModal = () => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: null
	});
};

/**
 * Increments the current step by one.
 * @function
 */
export const incrementStep = () => {
	getStore().dispatch({
		type: MODAL_NEXT_STEP,
		payload: null
	});
};

/**
 * Decrements the current step by one.
 * @function
 */
export const decrementStep = () => {
	getStore().dispatch({
		type: MODAL_PREVIOUS_STEP,
		payload: null
	});
};
