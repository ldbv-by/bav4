export const LINKLIST_CHANGED = 'example/linklist';
export const EXAMPLE_COORDINATES_CHANGED = 'example/coordinates';

export const initialState = {
	linkList: [
		{ name: 'MDN web docs', link: 'https://developer.mozilla.org/en-US/', initial: true },
		{ name: 'BayernAtlas v4', link: 'https://atlas.bayern.de', initial: true },
		{ name: 'BayernAtlas', link: 'https://geoportal.bayern.de/bayernatlas', initial: true },
		{ name: 'lit-html', link: 'https://lit.dev/docs/libraries/standalone-templates/', initial: true },
		{ name: 'taskmarks', link: 'https://github.com/norbertK/taskmarks', initial: true }
	],
	currentCoordinates: []
};

export const exampleReducer = (state = initialState, action) => {
	const { type, payload } = action;
	switch (type) {
		case LINKLIST_CHANGED: {
			return {
				...state,
				linkList: [...payload]
			};
		}

		case EXAMPLE_COORDINATES_CHANGED: {
			return {
				...state,
				currentCoordinates: [...payload]
			};

		}
	}
	return state;
};
