import { OPEN_CLOSED_CHANGED } from './reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};


export const openSidePanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: true
	});
};

export const closeSidePanel = () => {
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: false

	});
};

export const toggleSidePanel = () => {
	const { ui: { sidePanel: { open } } } = getStore().getState();
	getStore().dispatch({
		type: OPEN_CLOSED_CHANGED,
		payload: !open

	});
};


