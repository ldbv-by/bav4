import { THEME_CHANGED } from './uiTheme.reducer';
import { $injector } from '../../../injection';

const getStore = () => {
	const { StoreService } = $injector.inject('StoreService');
	return StoreService.getStore();
};

export const changeTheme = (theme) => {
	getStore().dispatch({
		type: THEME_CHANGED,
		payload: theme
	});
};

export const toggleTheme = () => {
	const { uiTheme: { theme } } = getStore().getState();
	const newTheme = (theme === 'dark') ? 'light' : 'dark';

	getStore().dispatch({
		type: THEME_CHANGED,
		payload: newTheme
	});
};
