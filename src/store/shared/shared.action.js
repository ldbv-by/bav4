/**
 * Action creators for commonly shared data
 * @module shared/action
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

/**
 * Set the {@link FileSaveResult}
 * @function
 * @param {FileSaveResult} fileSaveResult the fileSaveResult of the stored data
 */
export const setFileSaveResult = (fileSaveResult) => {
	getStore().dispatch({
		type: FILE_SAVE_RESULT_CHANGED,
		payload: fileSaveResult
	});
};
