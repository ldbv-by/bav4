/**
 * Action creators to change/update the properties of modal state.
 * @module modal/action
 */
import { MODAL_CHANGED } from './modal.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Data of the modal element
 * @typedef {Object} ModalData
 * @property {string} title The title of the modal element
 * @property {TemplateResult|string} content The content of the modal element. Could either be a lit-html TemplateResult or a plain string
 */

/**
 * Opens the modal.
 * @param {ModalData} ModalData 
 * @function
 */
export const openModal = (data) => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: data
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