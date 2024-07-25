/**
 * @module store/shared/shared_action
 */
import { $injector } from '../../injection';
import { FILE_SAVE_RESULT_CHANGED, TERMS_OF_USE_ACKNOWLEDGED_CHANGED } from './shared.reducer';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Set the acknowledgement of the user for the Terms of Use.
 * @function
 */
export const acknowledgeTermsOfUse = () => {
	getStore().dispatch({
		type: TERMS_OF_USE_ACKNOWLEDGED_CHANGED,
		payload: true
	});
};
