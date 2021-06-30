/**
 * Action creators to change/update the properties of modal state.
 * @module modal/action
 */
import { MODAL_CONTENT_ID, MODAL_CHANGED } from './modal.reducer';
import { $injector } from '../../../injection';
import { append } from '../../BaElement';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Options of the modal.
 * @typedef {Object} ModalOptions
 */


/**
 * Opens the modal.
 * @param {string} title The title of the modal
 * @param {string} content  The content of the modal. Could either be a a plain string, a template string or a lit-html TemplateResult.
 * @param {ModalOptions} options
 */
export const openModal = (title, content, options = {}) => {

	append(content, MODAL_CONTENT_ID);

	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: {
			title: title,
			options : options
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