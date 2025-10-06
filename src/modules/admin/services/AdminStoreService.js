/**
 * @module modules/admin/services/AdminStoreService
 */
import { combineReducers, createStore } from 'redux';
import { modalReducer } from '../../../store/modal/modal.reducer';
import { notificationReducer } from '../../../store/notifications/notifications.reducer';
import { bottomSheetReducer } from '../../../store/bottomSheet/bottomSheet.reducer';
import { createMediaReducer } from '../../../store/media/media.reducer';

/**
 * Service which configures, initializes and holds the redux store.
 * @class
 * @author herrmutig
 */
export class AdminStoreService {
	constructor() {
		const rootReducer = combineReducers({
			/*
			 * must be named like the field of the state
			 * see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
			 */
			modal: modalReducer,
			media: createMediaReducer(),
			notifications: notificationReducer,
			bottomSheet: bottomSheetReducer
		});

		this._store = createStore(rootReducer);
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
