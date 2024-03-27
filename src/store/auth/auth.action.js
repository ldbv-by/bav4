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
		payload: { signedIn: true, byUser: true }
	});
};

/**
 * Changes the auth status to signed out
 * @param {boolean} byUser `true` if the User requested a sign out
 */
export const setSignedOut = (byUser) => {
	getStore().dispatch({
		type: AUTH_STATUS_CHANGED,
		payload: { signedIn: false, byUser }
	});
};
