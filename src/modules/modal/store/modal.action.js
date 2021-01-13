import { MODAL_CHANGED } from './modal.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

export const openModal = (payload) => {	
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: payload
	});
};

export const closeModal = () => {
	getStore().dispatch({
		type: MODAL_CHANGED,
		payload: { title:false, content:false }
	});
};