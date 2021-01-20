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
 * Opens the modal.
 * @function
 */
export const openModal = (payload) => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: payload
	});
};

/**
 * Closes the modal.
 * @function
 */
export const closeModal = () => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: { title: false, content: false }
	});
};