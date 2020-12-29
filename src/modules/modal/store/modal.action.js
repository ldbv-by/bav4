import { MODAL_CLICK } from './modal.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

export const modalOpen = (payload) => {	
	getStore().dispatch({
		type: MODAL_CLICK,
		payload: payload
	});
	console.log('store',getStore().getState());
};

export const modalClose = () => {
	getStore().dispatch({
		type: MODAL_CLICK,
		payload: { title:false, content:false }
	});
};