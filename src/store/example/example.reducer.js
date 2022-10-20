export const LINKLIST_CHANGED = 'example/linklist';

export const initialState = {
	linkList: [
		{ name: 'MDN web docs', link: 'https://developer.mozilla.org/en-US/', initial: true },
		{ name: 'BayernAtlas v4', link: 'https://atlas.bayern.de', initial: true },
		{ name: 'BayernAtlas', link: 'https://geoportal.bayern.de/bayernatlas', initial: true },
		{ name: 'lit-html', link: 'https://lit.dev/docs/libraries/standalone-templates/', initial: true },
		{ name: 'taskmarks', link: 'https://github.com/norbertK/taskmarks', initial: true }
	]
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
	}
	return state;
};
