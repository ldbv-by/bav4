import { CONTEXT_ADD_MENUE_COMMANDS
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

export const addContextMenueCommand = (target, commands) => {
	getStore().dispatch({
		type: CONTEXT_ADD_MENUE_COMMANDS,
		payload: {
			contextTarget: target,
			commands: commands
		}
	});
};