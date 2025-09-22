/**
 * @module modules/admin/services/AdminStoreService
 */
import { combineReducers, createStore } from 'redux';
import { notificationReducer } from '../../../store/notifications/notifications.reducer';
import { bottomSheetReducer } from '../../../store/bottomSheet/bottomSheet.reducer';

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
			notifications: notificationReducer,
			bottomSheet: bottomSheetReducer
		});

		this._store = createStore(rootReducer);

		setTimeout(async () => {
			//register plugins
		});
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
