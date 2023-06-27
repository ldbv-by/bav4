/**
 * @module store/modal/modal_action
 */
import { MODAL_OPEN_CLOSE, MODAL_INCREMENT_STEP, MODAL_DECREMENT_STEP } from './modal.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Options of the modal.
 * @typedef {Object} ModalOptions
 * @property {number} [steps] Number of steps (used for multiple dialogs, e.g. as a wizard). Default is `1`
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
		type: MODAL_OPEN_CLOSE,
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
		type: MODAL_OPEN_CLOSE,
		payload: null
	});
};

/**
 * Increments the current step by one.
 * @function
 */
export const incrementStep = () => {
	getStore().dispatch({
		type: MODAL_INCREMENT_STEP,
		payload: null
	});
};

/**
 * Decrements the current step by one.
 * @function
 */
export const decrementStep = () => {
	getStore().dispatch({
		type: MODAL_DECREMENT_STEP,
		payload: null
	});
};
