import { CONTEXT_ADD_MENUE_COMMAND
} from './contextMenue.reducer';
import {
	$injector
} from '../../../injection';

const getStore = () => {
	const {
		StoreService
	} = $injector.inject('StoreService');
	return StoreService.getStore();
};

export const addContextMenueCommand = (target, command) => {
	getStore().dispatch({
		type: CONTEXT_ADD_MENUE_COMMAND,
		payload: {
			contextTarget: target,
			command: command
		}
	});
};