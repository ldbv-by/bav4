export const THEME_CHANGED = 'environment/theme';


const getInitialState = (_window = window) => {

	const theme = (_window.matchMedia && _window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
	return {
		theme: theme,
	};
};

export const initialState = getInitialState();

export const uiThemeReducer = (state = initialState, { type, payload }) => {

	switch (type) {
		case THEME_CHANGED: {

			return {
				...state,
				theme: payload
			};
		}
	}

	return state;
};
