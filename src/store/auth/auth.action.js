/**
 * @module store/auth/auth_action
 */
import { AUTH_STATUS_CHANGED } from './auth.reducer';
import { $injector } from '../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Changes the auth status to signed in
 */
export const setSignedIn = () => {
	getStore().dispatch({
		type: AUTH_STATUS_CHANGED,
		payload: true
	});
};

/**
 *
 * Changes the auth status to signed out
 */
export const setSignedOut = () => {
	getStore().dispatch({
		type: AUTH_STATUS_CHANGED,
		payload: false
	});
};
