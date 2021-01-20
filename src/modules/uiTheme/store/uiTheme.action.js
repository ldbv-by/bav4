/**
 * Action creators to change/update the properties of uiTheme state.
 * @module uiTheme/action
 */
import { THEME_CHANGED } from './uiTheme.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

/**
 * Changes the theme.
 * @function
 */
export const changeTheme = (theme) => {
	getStore().dispatch({
		type: THEME_CHANGED,
		payload: theme
	});
};

/**
 * Toggles the theme.
 * @function
 */
export const toggleTheme = () => {
	const { uiTheme: { theme } } = getStore().getState();
	const newTheme = (theme === 'dark') ? 'light' : 'dark';

	getStore().dispatch({
		type: THEME_CHANGED,
		payload: newTheme
	});
};
