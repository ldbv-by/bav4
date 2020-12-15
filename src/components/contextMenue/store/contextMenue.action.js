import { CONTEXT_MENUE_CLICK } from './contextMenue.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

export const contextMenueOpen = (contextMenuData) => {
	getStore().dispatch({
		type: CONTEXT_MENUE_CLICK,
		payload: contextMenuData
	});
};

export const contextMenueClose = () => {
	getStore().dispatch({
		type: CONTEXT_MENUE_CLICK,
		payload: { pointer: false, commands: false }
	});
};